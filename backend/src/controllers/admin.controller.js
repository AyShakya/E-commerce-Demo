import Order from "../models/Order.model.js";
import Product from "../models/Product.model.js";
import Refund from "../models/Refund.model.js";
import User from "../models/User.model.js";
import Payment from "../models/Payment.model.js";
import PaymentLog from "../models/PaymentLog.model.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import Reservation from "../models/Reservation.model.js";
import { finalizePayment } from "../services/paymentFinalizer.service.js";
import { reclaimExpiredStock } from "../services/reclaim.service.js";
import { isValidObjectId } from "../utils/isValidObject.js";

const RECONCILE_SAMPLE_LIMIT = Number(process.env.ADMIN_RECONCILE_SAMPLE_LIMIT || 20);
const FINALIZATION_LOCK_TTL_MS = Number(
  process.env.PAYMENT_FINALIZATION_LOCK_TTL_MS || 2 * 60 * 1000,
);

export const getAdminSummary = asyncHandler(async (req, res) => {
  const [totalOrders, totalUsers, totalProducts] = await Promise.all([
    Order.countDocuments(),
    User.countDocuments({ role: "user" }),
    Product.countDocuments({ isActive: true }),
  ]);

  res.json({
    totalOrders,
    totalUsers,
    totalProducts,
  });
});

export const getPaymentLogsByOrder = asyncHandler(async (req, res) => {
  const logs = await PaymentLog.find({
    order: req.params.orderId,
  })
    .select("eventType providerRef amount metadata createdAt")
    .sort("createdAt")
    .lean();

  res.json(logs);
});

export const getAdminLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 25, eventType, orderId, userId } = req.query;

  const query = {};

  if (eventType) query.eventType = eventType;
  if (orderId) query.order = orderId;
  if (userId) query.user = userId;

  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  const skip = (pageNumber - 1) * limitNumber;

  const [logs, total] = await Promise.all([
    PaymentLog.find(query)
      .select("order user eventType provider providerRef amount metadata createdAt")
      .populate("user", "name email")
      .populate("order", "totalAmount paymentStatus fulfillmentStatus createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .lean(),
    PaymentLog.countDocuments(query),
  ]);

  res.json({
    data: logs,
    pagination: {
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber),
      hasMore: skip + logs.length < total,
    },
  });
});

export const getReservations = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;

  const query = {};
  if (status) query.status = status;

  const skip = (page - 1) * limit;

  const [reservations, total] = await Promise.all([
    Reservation.find(query)
      .select("user product quantity payment status expiresAt createdAt updatedAt")
      .populate("user", "name email")
      .populate("product", "title price")
      .sort("-createdAt")
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Reservation.countDocuments(query),
  ]);

  res.json({
    data: reservations,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  });
});

export const getAllRefunds = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;

  const query = {};
  if (status) query.status = status;

  const skip = (page - 1) * limit;

  const [refunds, total] = await Promise.all([
    Refund.find(query)
      .select("payment amount providerRefundId status createdAt updatedAt")
      .populate({
        path: "payment",
        select: "amount refundedAmount status providerOrderId providerPaymentId order user",
        populate: [
          { path: "order", select: "totalAmount paymentStatus fulfillmentStatus createdAt" },
          { path: "user", select: "name email" },
        ],
      })
      .sort("-createdAt")
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Refund.countDocuments(query),
  ]);

  res.json({
    data: refunds,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
      hasMore: skip + refunds.length < total,
    },
  });
});

export const retryFinalizePayment = asyncHandler(async (req, res) => {
  if (!isValidObjectId(req.params.paymentId)) {
    return res.status(400).json({ message: "Invalid payment ID" });
  }

  const payment = await Payment.findById(req.params.paymentId)
    .select("providerOrderId providerPaymentId status order finalizationState")
    .lean();

  if (!payment) {
    return res.status(404).json({ message: "Payment not found" });
  }

  if (!payment.providerOrderId) {
    return res.status(400).json({
      message: "Payment cannot be retried because provider order reference is missing",
    });
  }

  const result = await finalizePayment({
    providerOrderId: payment.providerOrderId,
    providerPaymentId: payment.providerPaymentId,
    source: "admin_retry_finalize",
    metadata: {
      paymentId: payment._id,
    },
  });

  if (result.notFound) {
    return res.status(404).json({ message: result.message });
  }

  if (result.conflict) {
    return res.status(409).json(result);
  }

  if (result.processing) {
    return res.status(202).json(result);
  }

  return res.json(result);
});

export const runAdminReconcile = asyncHandler(async (req, res) => {
  const staleLockBefore = new Date(Date.now() - FINALIZATION_LOCK_TTL_MS);
  const now = new Date();

  const [expiredReservationCount, stalePayments, capturedWithoutOrder] = await Promise.all([
    Reservation.countDocuments({ status: "ACTIVE", expiresAt: { $lt: now } }),
    Payment.find({
      order: null,
      providerOrderId: { $ne: null },
      finalizationState: "FINALIZING",
      finalizationLockedAt: { $lt: staleLockBefore },
    })
      .select("_id providerOrderId providerPaymentId status finalizationState finalizationLockedAt")
      .sort({ finalizationLockedAt: 1 })
      .limit(RECONCILE_SAMPLE_LIMIT)
      .lean(),
    Payment.find({
      order: null,
      providerOrderId: { $ne: null },
      status: "SUCCESS",
    })
      .select("_id providerOrderId providerPaymentId status finalizationState finalizationLockedAt")
      .sort({ updatedAt: -1 })
      .limit(RECONCILE_SAMPLE_LIMIT)
      .lean(),
  ]);

  const repairedPayments = [];
  const seenIds = new Set();

  for (const payment of [...stalePayments, ...capturedWithoutOrder]) {
    const key = String(payment._id);

    if (seenIds.has(key)) {
      continue;
    }

    seenIds.add(key);

    const result = await finalizePayment({
      providerOrderId: payment.providerOrderId,
      providerPaymentId: payment.providerPaymentId,
      source: "admin_reconcile",
      metadata: {
        paymentId: payment._id,
      },
    });

    repairedPayments.push({
      paymentId: payment._id,
      result: result.processing
        ? "processing"
        : result.conflict
          ? "conflict"
          : result.verified
            ? "reconciled"
            : "skipped",
      message: result.message,
    });
  }

  const reclaimedStock = await reclaimExpiredStock();

  return res.json({
    scanned: {
      expiredReservations: expiredReservationCount,
      stalePayments: stalePayments.length,
      capturedWithoutOrder: capturedWithoutOrder.length,
    },
    repairedPayments,
    reclaimedStock,
  });
});
