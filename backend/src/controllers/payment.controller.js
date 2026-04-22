import Payment from "../models/Payment.model.js";
import Refund from "../models/Refund.model.js";
import Product from "../models/Product.model.js";
import { razorpay } from "../services/payment.service.js";
import { logPaymentEvent } from "../services/paymentAudit.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Reservation from "../models/Reservation.model.js";

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
        return res.status(200).json({
          message: "Resuming your active checkout session",
          resumed: true,
          reservationId: existingReservation._id,
          expiresAt: existingReservation.expiresAt,
          key: process.env.RAZORPAY_KEY_ID,
          razorpayOrderId: existingPayment?.providerOrderId,
          amount: (existingPayment?.amount || 0) * 100,
          currency: "INR",
        });
      }
    }
  }

  // 1️⃣ Try to reserve inventory atomically
  let product = await Product.findOneAndUpdate(
    {
      _id: productId,
      isActive: true,
      quantity: { $gte: quantity },
    },
    { $inc: { quantity: -quantity } },
    { new: true },
  );

  // 2️⃣ If stock is low, try "Surgical Reclamation" before giving up
  if (!product) {
    await reclaimExpiredStock(productId);
    product = await Product.findOneAndUpdate(
      {
        _id: productId,
        isActive: true,
        quantity: { $gte: quantity },
      },
      { $inc: { quantity: -quantity } },
      { new: true },
    );
  }

  if (!product) {
    return res.status(400).json({ message: "Insufficient stock. This item may be locked in other checkout sessions." });
  }

  // 2️⃣ Create reservation
  const expiresAt = new Date(Date.now() + RESERVATION_MINUTES * 60 * 1000);

  const reservation = await Reservation.create({
    user: req.user.id,
    product: product._id,
    quantity,
    expiresAt,
  });


  const amount = product.price * quantity;

  // 3️⃣ Create payment
  const payment = await Payment.create({
    user: req.user.id,
    provider: "RAZORPAY",
    amount,
    status: "PROCESSING",
  });

  reservation.payment = payment._id;
  await reservation.save();

  // 4️⃣ Create Razorpay order
  const razorpayOrder = await razorpay.orders.create({
    amount: amount * 100,
    currency: "INR",
    receipt: payment._id.toString(),
    notes: {
      reservationId: reservation._id.toString(),
    },
  });

  payment.providerOrderId = razorpayOrder.id;
  await payment.save();

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
