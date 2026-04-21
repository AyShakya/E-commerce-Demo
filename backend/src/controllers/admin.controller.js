import Order from "../models/Order.model.js";
import Product from "../models/Product.model.js";
import Refund from "../models/Refund.model.js";
import User from "../models/User.model.js";
import PaymentLog from "../models/PaymentLog.model.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import Reservation from "../models/Reservation.model.js";

export const getAdminSummary = asyncHandler(async (req, res) => {
  const totalOrders = await Order.countDocuments();
  const totalUsers = await User.countDocuments({ role: "user" });
  const totalProducts = await Product.countDocuments({ isActive: true });

  res.json({
    totalOrders,
    totalUsers,
    totalProducts,
  });
});

export const getPaymentLogsByOrder = asyncHandler(async (req, res) => {
  const logs = await PaymentLog.find({
    order: req.params.orderId,
  }).sort("createdAt");

  res.json(logs);
});

export const getReservations = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;

  const query = {};
  if (status) query.status = status;

  const skip = (page - 1) * limit;

  const [reservations, total] = await Promise.all([
    Reservation.find(query)
      .populate("user", "email")
      .populate("product", "title")
      .sort("-createdAt")
      .skip(skip)
      .limit(Number(limit)),
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
      .populate({
        path: "payment",
        populate: { path: "order user" },
      })
      .sort("-createdAt")
      .skip(skip)
      .limit(Number(limit)),
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
