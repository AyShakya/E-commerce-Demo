import express from "express";
import {
  getAdminSummary,
  getAllRefunds,
  getAdminLogs,
  getPaymentLogsByOrder,
  getReservations,
  retryFinalizePayment,
  runAdminReconcile,
} from "../controllers/admin.controller.js";
import { protect, adminOnly } from "../middlewares/auth.middleware.js";
import { adminLimiter } from "../utils/ratelimiter.js";

const router = express.Router();

router.use(adminLimiter);
router.get("/summary", protect, adminOnly, getAdminSummary);

router.get(
  "/payment-logs/:orderId",
  protect,
  adminOnly,
  getPaymentLogsByOrder
);

router.get("/logs", protect, adminOnly, getAdminLogs);

router.get(
  "/reservations",
  protect,
  adminOnly,
  getReservations
);

router.get("/refunds", protect, adminOnly, getAllRefunds);
router.post("/reconcile", protect, adminOnly, runAdminReconcile);
router.post("/payments/:paymentId/retry-finalize", protect, adminOnly, retryFinalizePayment);


export default router;
