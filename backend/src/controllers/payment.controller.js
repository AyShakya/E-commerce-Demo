import Payment from "../models/Payment.model.js";
import Refund from "../models/Refund.model.js";
import Product from "../models/Product.model.js";
import { razorpay } from "../services/payment.service.js";
import { logPaymentEvent } from "../services/paymentAudit.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Reservation from "../models/Reservation.model.js";

const RESERVATION_MINUTES = 15;

export const createPayment = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId || !quantity || quantity < 1) {
    return res.status(400).json({ message: "Invalid request" });
  }

  //Idempotency 
  const existingReservation = await Reservation.findOne({
    user: req.user.id,
    product: productId,
    status: "ACTIVE",
  });
  
  if (existingReservation) {
    return res.status(400).json({
      message: "You already have a pending checkout for this item",
    });
  }

  // 1️⃣ Reserve inventory atomically
  const product = await Product.findOneAndUpdate(
    {
      _id: productId,
      isActive: true,
      quantity: { $gte: quantity },
    },
    { $inc: { quantity: -quantity } },
    { new: true },
  );

  if (!product) {
    return res.status(400).json({ message: "Insufficient stock" });
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
