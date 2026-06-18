import mongoose from "mongoose";

import Payment from "../models/Payment.model.js";
import Refund from "../models/Refund.model.js";
import Product from "../models/Product.model.js";
import { razorpay } from "../services/payment.service.js";
import { logPaymentEvent } from "../services/paymentAudit.service.js";
import { finalizePayment } from "../services/paymentFinalizer.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Reservation from "../models/Reservation.model.js";
import crypto from "crypto";

const RESERVATION_MINUTES = 15;

const expireReservationAndRestock = async (reservation, reason = "AUTO_EXPIRED") => {
  const updated = await Reservation.findOneAndUpdate(
    {
      _id: reservation._id,
      status: "ACTIVE",
    },
    {
      $set: { status: "EXPIRED" },
    },
    { new: true },
  );

  if (!updated) return false;

  await Product.findByIdAndUpdate(updated.product, {
    $inc: { quantity: updated.quantity },
  });

  if (updated.payment) {
    await Payment.findByIdAndUpdate(updated.payment, {
      $set: { status: "FAILED" },
    });
  }

  await logPaymentEvent({
    order: null,
    user: updated.user,
    eventType: reason,
    metadata: {
      reservationId: updated._id,
      productId: updated.product,
      quantity: updated.quantity,
    },
  });

  return true;
};

const getReservationStatusPayload = (reservation, payment) => {
  const now = Date.now();
  const expiresAt = reservation?.expiresAt ? new Date(reservation.expiresAt) : null;
  const remainingSeconds = expiresAt
    ? Math.max(0, Math.floor((expiresAt.getTime() - now) / 1000))
    : 0;

  let state = "NONE";
  if (!reservation) state = "NONE";
  else if (reservation.status === "COMPLETED") state = "COMPLETED";
  else if (reservation.status === "EXPIRED") state = "EXPIRED";
  else if (payment?.status === "FAILED") state = "FAILED";
  else state = "ACTIVE";

  return {
    state,
    reservationId: reservation?._id || null,
    paymentId: payment?._id || null,
    paymentStatus: payment?.status || null,
    finalizationState: payment?.finalizationState || null,
    providerOrderId: payment?.providerOrderId || null,
    expiresAt,
    remainingSeconds,
    retryAllowed: ["NONE", "EXPIRED", "FAILED"].includes(state),
  };
};

export const getCheckoutStatus = asyncHandler(async (req, res) => {
  const { productId } = req.query;

  if (!productId) {
    return res.status(400).json({ message: "productId is required" });
  }

  const reservation = await Reservation.findOne({
    user: req.user.id,
    product: productId,
  })
    .sort({ createdAt: -1 })
    .populate("payment");

  if (!reservation) {
    return res.json(getReservationStatusPayload(null, null));
  }

  if (reservation.status === "ACTIVE" && reservation.expiresAt.getTime() <= Date.now()) {
    await expireReservationAndRestock(reservation, "CHECKOUT_AUTO_EXPIRED");
    const expired = await Reservation.findById(reservation._id).populate("payment");
    return res.json(getReservationStatusPayload(expired, expired?.payment || null));
  }

  if (reservation.status === "ACTIVE" && reservation.payment?.status === "FAILED") {
    await expireReservationAndRestock(reservation, "CHECKOUT_FAILED_EXPIRED");
    const failed = await Reservation.findById(reservation._id).populate("payment");
    return res.json(getReservationStatusPayload(failed, failed?.payment || null));
  }

  return res.json(getReservationStatusPayload(reservation, reservation.payment || null));
});

export const cancelCheckout = asyncHandler(async (req, res) => {
  const { productId, reservationId } = req.body;

  if (!productId && !reservationId) {
    return res.status(400).json({ message: "productId or reservationId is required" });
  }

  const query = {
    user: req.user.id,
    status: "ACTIVE",
    ...(reservationId ? { _id: reservationId } : { product: productId }),
  };

  const reservation = await Reservation.findOne(query);

  if (!reservation) {
    return res.json({
      message: "No active checkout session found",
      released: false,
    });
  }

  const released = await expireReservationAndRestock(reservation, "CHECKOUT_CANCELLED_BY_USER");

  return res.json({
    message: released
      ? "Checkout session cancelled and stock restored"
      : "Checkout session was already closed",
    released,
    reservationId: reservation._id,
  });
});

import { reclaimExpiredStock } from "../services/reclaim.service.js";

export const createPayment = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId || !quantity || quantity < 1) {
    return res.status(400).json({ message: "Invalid request" });
  }

  if (!razorpay) {
    return res.status(503).json({ message: "Payment gateway is not configured on this server" });
  }

  // Idempotency: Find existing active reservation
  const existingReservation = await Reservation.findOne({
    user: req.user.id,
    product: productId,
    status: "ACTIVE",
  }).populate("payment");

  if (existingReservation) {
    // If quantity changed, we must expire old and start new to avoid inconsistencies
    if (existingReservation.quantity !== quantity) {
      await expireReservationAndRestock(existingReservation, "CHECKOUT_QUANTITY_CHANGED");
    } else if (existingReservation.expiresAt.getTime() <= Date.now()) {
      await expireReservationAndRestock(existingReservation, "CHECKOUT_AUTO_EXPIRED");
    } else {
      const existingPayment = existingReservation.payment;
      if (existingPayment?.status === "FAILED") {
        await expireReservationAndRestock(existingReservation, "CHECKOUT_FAILED_EXPIRED");
      } else {
        let razorpayOrderId = existingPayment?.providerOrderId;

        if (!razorpayOrderId && existingPayment) {
          const recoveredOrder = await razorpay.orders.create({
            amount: existingPayment.amount * 100,
            currency: "INR",
            receipt: existingPayment._id.toString(),
            notes: {
              reservationId: existingReservation._id.toString(),
            },
          });

          existingPayment.providerOrderId = recoveredOrder.id;
          await existingPayment.save();
          razorpayOrderId = recoveredOrder.id;
        }

        return res.status(200).json({
          message: "Resuming your active checkout session",
          resumed: true,
          reservationId: existingReservation._id,
          expiresAt: existingReservation.expiresAt,
          key: process.env.RAZORPAY_KEY_ID,
          razorpayOrderId,
          amount: (existingPayment?.amount || 0) * 100,
          currency: "INR",
        });
      }
    }
  }

  const session = await mongoose.startSession();

  let reservation;
  let payment;
  let product;
  let expiresAt;

  try {
    await session.withTransaction(async () => {
      product = await Product.findOneAndUpdate(
        {
          _id: productId,
          isActive: true,
          quantity: { $gte: quantity },
        },
        { $inc: { quantity: -quantity } },
        { new: true, session },
      );

      if (!product) {
        throw new Error("INSUFFICIENT_STOCK");
      }

      expiresAt = new Date(Date.now() + RESERVATION_MINUTES * 60 * 1000);

      reservation = await Reservation.create(
        [
          {
            user: req.user.id,
            product: product._id,
            quantity,
            expiresAt,
          },
        ],
        { session },
      ).then((docs) => docs[0]);

      payment = await Payment.create(
        [
          {
            user: req.user.id,
            provider: "RAZORPAY",
            amount: product.price * quantity,
            status: "PROCESSING",
          },
        ],
        { session },
      ).then((docs) => docs[0]);

      reservation.payment = payment._id;
      await reservation.save({ session });
    });
  } catch (error) {
    if (error.message === "INSUFFICIENT_STOCK") {
      // 2️⃣ If stock is low, try "Surgical Reclamation" before giving up
      await reclaimExpiredStock(productId);

      await session.endSession();
      session = null;

      const retrySession = await mongoose.startSession();
      try {
        await retrySession.withTransaction(async () => {
          const retriedProduct = await Product.findOneAndUpdate(
            {
              _id: productId,
              isActive: true,
              quantity: { $gte: quantity },
            },
            { $inc: { quantity: -quantity } },
            { new: true, session: retrySession },
          );

          if (!retriedProduct) {
            throw new Error("INSUFFICIENT_STOCK_RETRY");
          }

          product = retriedProduct;
          expiresAt = new Date(Date.now() + RESERVATION_MINUTES * 60 * 1000);

          reservation = await Reservation.create(
            [
              {
                user: req.user.id,
                product: product._id,
                quantity,
                expiresAt,
              },
            ],
            { session: retrySession },
          ).then((docs) => docs[0]);

          payment = await Payment.create(
            [
              {
                user: req.user.id,
                provider: "RAZORPAY",
                amount: product.price * quantity,
                status: "PROCESSING",
              },
            ],
            { session: retrySession },
          ).then((docs) => docs[0]);

          reservation.payment = payment._id;
          await reservation.save({ session: retrySession });
        });
      } catch (retryError) {
        if (retryError.message === "INSUFFICIENT_STOCK_RETRY") {
          return res.status(400).json({ message: "Insufficient stock. This item may be locked in other checkout sessions." });
        }
        throw retryError;
      } finally {
        await retrySession.endSession();
      }
    } else {
      await session.endSession();
      session = null;
      throw error;
    }
  } finally {
    if (session?.client) {
      await session.endSession();
    }
  }

  const amount = product.price * quantity;

  // 4️⃣ Create Razorpay order
  const razorpayOrder = await razorpay.orders.create({
    amount: amount * 100,
    currency: "INR",
    receipt: payment._id.toString(),
    notes: {
      reservationId: reservation._id.toString(),
    },
  });

  try {
    await Payment.findByIdAndUpdate(payment._id, {
      $set: {
        providerOrderId: razorpayOrder.id,
      },
    });
  } catch (error) {
    await expireReservationAndRestock(reservation, "PAYMENT_GATEWAY_ORDER_SYNC_FAILED");
    await Payment.findByIdAndUpdate(payment._id, {
      $set: {
        status: "FAILED",
      },
    });

    throw error;
  }

  await logPaymentEvent({
    order: null,
    user: req.user.id,
    eventType: "PAYMENT_INTENT_CREATED",
    providerRef: razorpayOrder.id,
    amount,
  });

  res.json({
    resumed: false,
    reservationId: reservation._id,
    expiresAt,
    key: process.env.RAZORPAY_KEY_ID,
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
  });
});

export const refundPayment = asyncHandler(async (req, res) => {
  if (!razorpay) {
    return res.status(503).json({ message: "Payments not enabled" });
  }
  const { paymentId, amount } = req.body;

  const payment = await Payment.findById(paymentId);
  if (!payment) {
    return res.status(404).json({ message: "Payment not found" });
  }

  if (!["SUCCESS", "PARTIALLY_REFUNDED"].includes(payment.status)) {
    return res.status(400).json({ message: "Payment not refundable" });
  }

  const refundableAmount = payment.amount - payment.refundedAmount;

  if (amount <= 0 || amount > refundableAmount) {
    return res.status(400).json({
      message: `Invalid refund amount. Max refundable: ₹${refundableAmount}`,
    });
  }

  const refund = await Refund.create({
    payment: payment._id,
    amount,
    status: "REQUESTED",
  });

  try {
    const razorpayRefund = await razorpay.payments.refund(
      payment.providerPaymentId,
      {
        amount: amount * 100,
      },
    );

    refund.providerRefundId = razorpayRefund.id;
    refund.status = "PROCESSING";
    await refund.save();

    await logPaymentEvent({
      order: payment.order,
      user: payment.user,
      eventType: "REFUND_REQUESTED",
      providerRef: razorpayRefund.id,
      amount,
      metadata: razorpayRefund,
    });

    res.json({
      message: "Refund initiated successfully",
      refundId: refund._id,
    });
  } catch (err) {
    refund.status = "FAILED";
    await refund.save();

    await logPaymentEvent({
      order: payment.order,
      user: payment.user,
      eventType: "REFUND_FAILED",
      amount,
      metadata: err,
    });

    throw err;
  }
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ message: "Missing payment verification fields" });
  }

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ message: "Invalid payment signature" });
  }

  const result = await finalizePayment({
    providerOrderId: razorpay_order_id,
    providerPaymentId: razorpay_payment_id,
    source: "client_verify",
    metadata: {
      orderId: razorpay_order_id,
    },
  });

  if (result.notFound) {
    return res.status(404).json({ message: result.message });
  }

  if (result.conflict) {
    return res.status(409).json({ message: result.message });
  }

  if (result.processing) {
    return res.status(202).json(result);
  }

  return res.json(result);
});
