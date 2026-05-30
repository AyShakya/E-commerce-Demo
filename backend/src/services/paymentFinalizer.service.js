import mongoose from "mongoose";
import crypto from "crypto";

import Order from "../models/Order.model.js";
import Payment from "../models/Payment.model.js";
import Reservation from "../models/Reservation.model.js";
import { logPaymentEvent } from "./paymentAudit.service.js";

const FINALIZATION_LOCK_TTL_MS = Number(
  process.env.PAYMENT_FINALIZATION_LOCK_TTL_MS || 2 * 60 * 1000,
);

const buildSuccessResponse = (payment, orderId, message) => ({
  verified: true,
  orderId,
  message,
  processing: false,
});

const buildProcessingResponse = (message) => ({
  verified: false,
  processing: true,
  message,
});

const claimFinalizationLock = async (paymentId) => {
  const now = new Date();
  const staleLockBefore = new Date(Date.now() - FINALIZATION_LOCK_TTL_MS);
  const finalizationToken = crypto.randomUUID();

  const payment = await Payment.findOneAndUpdate(
    {
      _id: paymentId,
      order: null,
      $or: [
        { finalizationState: { $in: ["READY", "FAILED"] } },
        {
          finalizationState: "FINALIZING",
          finalizationLockedAt: { $lt: staleLockBefore },
        },
      ],
    },
    {
      $set: {
        finalizationState: "FINALIZING",
        finalizationLockedAt: now,
        finalizationToken,
      },
      $inc: { finalizationAttempts: 1 },
    },
    { new: true },
  );

  return { payment, finalizationToken };
};

const releaseFinalizationLock = async (paymentId, updates = {}) => {
  await Payment.findByIdAndUpdate(paymentId, {
    $set: {
      finalizationState: updates.finalizationState || "FAILED",
      finalizationLockedAt: null,
      finalizationToken: null,
      ...(updates.paymentUpdates || {}),
    },
  });
};

export const finalizePayment = async ({
  providerOrderId,
  providerPaymentId,
  source = "unknown",
  metadata = {},
}) => {
  const paymentRecord = await Payment.findOne({ providerOrderId });

  if (!paymentRecord) {
    return {
      verified: false,
      processing: false,
      message: "Payment record not found",
      notFound: true,
    };
  }

  if (paymentRecord.order) {
    return buildSuccessResponse(
      paymentRecord,
      paymentRecord.order,
      "Payment already verified",
    );
  }

  const { payment: claimedPayment } = await claimFinalizationLock(paymentRecord._id);

  if (!claimedPayment) {
    const latest = await Payment.findById(paymentRecord._id);

    if (latest?.order) {
      return buildSuccessResponse(
        latest,
        latest.order,
        "Payment already verified",
      );
    }

    return buildProcessingResponse(
      "Payment confirmation is already in progress. Please try again shortly.",
    );
  }

  try {
    const session = await mongoose.startSession();

    try {
      let result = null;

      await session.withTransaction(async () => {
        const reservation = await Reservation.findOne({ payment: claimedPayment._id })
          .session(session)
          .populate({ path: "product", options: { session } });

        if (!reservation || reservation.status !== "ACTIVE") {
          result = {
            verified: false,
            processing: false,
            message:
              "Payment captured but checkout session is not active. Please contact support for reconciliation.",
            conflict: true,
          };
          return;
        }

        const existingOrder = await Order.findOne({ payment: claimedPayment._id }).session(
          session,
        );

        if (existingOrder) {
          claimedPayment.order = existingOrder._id;
          claimedPayment.status = "SUCCESS";
          claimedPayment.providerPaymentId =
            providerPaymentId || claimedPayment.providerPaymentId;
          claimedPayment.finalizationState = "COMPLETED";
          claimedPayment.finalizationLockedAt = null;
          claimedPayment.finalizationToken = null;
          await claimedPayment.save({ session });

          reservation.status = "COMPLETED";
          await reservation.save({ session });

          result = buildSuccessResponse(
            claimedPayment,
            existingOrder._id,
            "Payment already verified",
          );
          return;
        }

        const order = await Order.create(
          [
            {
              user: reservation.user,
              items: [
                {
                  product: reservation.product._id,
                  title: reservation.product.title,
                  price: reservation.product.price,
                  quantity: reservation.quantity,
                },
              ],
              payment: claimedPayment._id,
              totalAmount: claimedPayment.amount,
              paymentStatus: "PAID",
            },
          ],
          { session },
        ).then((docs) => docs[0]);

        claimedPayment.order = order._id;
        claimedPayment.status = "SUCCESS";
        claimedPayment.providerPaymentId =
          providerPaymentId || claimedPayment.providerPaymentId;
        claimedPayment.finalizationState = "COMPLETED";
        claimedPayment.finalizationLockedAt = null;
        claimedPayment.finalizationToken = null;
        await claimedPayment.save({ session });

        reservation.status = "COMPLETED";
        await reservation.save({ session });

        result = buildSuccessResponse(
          claimedPayment,
          order._id,
          "Payment verified and order created",
        );
      });

      if (result?.conflict) {
        await releaseFinalizationLock(claimedPayment._id, {
          finalizationState: "FAILED",
        });

        return result;
      }

      await logPaymentEvent({
        order: result.orderId,
        user: claimedPayment.user,
        eventType: "PAYMENT_SUCCESS",
        providerRef: providerPaymentId,
        amount: claimedPayment.amount,
        metadata: {
          source,
          providerOrderId,
          ...metadata,
        },
      });

      return result;
    } finally {
      await session.endSession();
    }
  } catch (err) {
    await releaseFinalizationLock(claimedPayment._id, {
      finalizationState: "FAILED",
    });

    throw err;
  }
};
