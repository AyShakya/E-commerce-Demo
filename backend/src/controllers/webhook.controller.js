import crypto from "crypto";
import Payment from "../models/Payment.model.js";
import Order from "../models/Order.model.js";
import Refund from "../models/Refund.model.js";
import Product from "../models/Product.model.js";
import { logPaymentEvent } from "../services/paymentAudit.service.js";
import { finalizePayment } from "../services/paymentFinalizer.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/User.model.js";
import Reservation from "../models/Reservation.model.js";

export const razorpayWebhook = asyncHandler(async (req, res) => {
  let event;

  try {
    console.log("[Razorpay Webhook] Received event");
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

      const result = await finalizePayment({
        providerOrderId: entity.order_id,
        providerPaymentId: entity.id,
        source: "webhook_payment_captured",
        metadata: {
          notes: entity.notes || {},
        },
      });

      if (!result.notFound && !result.conflict && !result.processing) {
        return res.json({ ok: true });
      }

      if (result.conflict) {
        console.warn("[Razorpay Webhook] Captured payment without active reservation", {
          orderId: entity.order_id,
          paymentId: entity.id,
          reservationFound: false,
          reservationStatus: "INACTIVE_OR_MISSING",
        });
      }

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
        const wasAlreadyFullyRefunded = order.paymentStatus === "REFUNDED";

        order.paymentStatus =
          payment.status === "REFUNDED" ? "REFUNDED" : "PARTIALLY_REFUNDED";
        await order.save();

        // 🔄 Restore inventory on refund ONLY when the order becomes FULLY REFUNDED,
        // and only if we haven't already restored stock for this order.
        if (order.paymentStatus === "REFUNDED" && !wasAlreadyFullyRefunded) {
          for (const item of order.items) {
            await Product.findByIdAndUpdate(item.product, {
              $inc: { quantity: item.quantity },
            });
          }
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
