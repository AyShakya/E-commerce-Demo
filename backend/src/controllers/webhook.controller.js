import crypto from "crypto";
import Payment from "../models/Payment.model.js";
import Order from "../models/Order.model.js";
import Refund from "../models/Refund.model.js";
import Product from "../models/Product.model.js";
import { logPaymentEvent } from "../services/paymentAudit.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/User.model.js";
import Reservation from "../models/Reservation.model.js";

export const razorpayWebhook = asyncHandler(async (req, res) => {
  let event;

  try {
    const signature = req.headers["x-razorpay-signature"];

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(req.rawBody)
      .digest("hex");

    if (signature !== expectedSignature) {
      return res.status(400).send("Invalid signature");
    }

    event = req.body;
  } catch (err) {
    console.error("Webhook signature verification failed", err);
    return res.status(400).send("Bad request");
  }

  try {
    if (event.event === "payment.captured") {
      const entity = event.payload.payment.entity;

      const payment = await Payment.findOne({
        providerOrderId: entity.order_id,
      });

      if (!payment || payment.status === "SUCCESS") {
        return res.json({ ok: true });
      }

      payment.status = "SUCCESS";
      payment.providerPaymentId = entity.id;
      await payment.save();

      const reservationId = entity.notes?.reservationId;
      const reservation =
        await Reservation.findById(reservationId).populate("product");

      if (!reservation || reservation.status !== "ACTIVE") {
        // Payment succeeded but reservation expired → admin can refund later
        return res.json({ ok: true });
      }

      // Create order
      const order = await Order.create({
        user: reservation.user,
        items: [
          {
            product: reservation.product._id,
            title: reservation.product.title,
            price: reservation.product.price,
            quantity: reservation.quantity,
          },
        ],
        totalAmount: payment.amount,
        paymentStatus: "PAID",
      });

      payment.order = order._id;
      await payment.save();

      reservation.status = "COMPLETED";
      await reservation.save();

      await logPaymentEvent({
        order: order._id,
        user: reservation.user,
        eventType: "PAYMENT_SUCCESS",
        providerRef: entity.id,
        amount: payment.amount,
      });

      return res.json({ ok: true });
    }
    if (event.event === "payment.failed") {
      const entity = event.payload.payment.entity;

      const payment = await Payment.findOne({
        providerOrderId: entity.order_id,
      });

      if (!payment) return res.json({ ok: true });

      payment.status = "FAILED";
      await payment.save();

      const reservation = await Reservation.findOne({
        payment: payment._id,
        status: "ACTIVE",
      });

      if (reservation) {
        // 🔓 Restore stock immediately
        await Product.findByIdAndUpdate(reservation.product, {
          $inc: { quantity: reservation.quantity },
        });

        reservation.status = "EXPIRED";
        await reservation.save();
      }

      await logPaymentEvent({
        order: payment.order,
        user: payment.user,
        eventType: "PAYMENT_FAILED",
        providerRef: entity.id,
        metadata: entity,
      });

      return res.json({ ok: true });
    }
    if (event.event === "refund.processed") {
      const entity = event.payload.refund.entity;

      const refund = await Refund.findOne({
        providerRefundId: entity.id,
      });

      if (!refund || refund.status === "COMPLETED") {
        return res.json({ ok: true });
      }

      refund.status = "COMPLETED";
      await refund.save();

      const payment = await Payment.findById(refund.payment);
      payment.refundedAmount += refund.amount;

      payment.status =
        payment.refundedAmount < payment.amount
          ? "PARTIALLY_REFUNDED"
          : "REFUNDED";

      await payment.save();

      const order = await Order.findById(payment.order);

      if (order) {
        order.paymentStatus =
          payment.status === "REFUNDED" ? "REFUNDED" : "PARTIALLY_REFUNDED";
        await order.save();

        // 🔄 Restore inventory on refund
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { quantity: item.quantity },
          });
        }
      }

      await logPaymentEvent({
        order: order?._id,
        user: order?.user,
        eventType: "REFUND_SUCCESS",
        providerRef: entity.id,
        amount: refund.amount,
        metadata: entity,
      });
      return res.json({ ok: true });
    }
    if (event.event === "dispute.created" || event.event === "dispute.closed") {
      await logPaymentEvent({
        order: null,
        eventType:
          event.event === "dispute.created"
            ? "DISPUTE_OPENED"
            : "DISPUTE_CLOSED",
        metadata: event.payload.dispute.entity,
      });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error("Webhook processing error", err);
    return res.json({ ok: true });
  }
});
