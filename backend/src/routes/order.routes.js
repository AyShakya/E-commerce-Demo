import express from "express";
import {
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  getOrdersByUser,
  getOrderById,
} from "../controllers/order.controller.js";

import { protect, adminOnly } from "../middlewares/auth.middleware.js";

const router = express.Router();

/* USER */
router.get("/orders/my", protect, getMyOrders);
router.get("/orders/:id", protect, getOrderById);
// router.patch("/orders/:id/cancel", protect, cancelOrder);

/* ADMIN */
router.get("/admin/orders/", protect, adminOnly, getAllOrders);
router.patch("/admin/orders/:id/status", protect, adminOnly, updateOrderStatus);
router.get(
  "/user/:userId",
  protect,
  adminOnly,
  getOrdersByUser
);

export default router;
