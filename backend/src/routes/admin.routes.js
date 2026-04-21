import express from "express";
import { getAdminSummary,getAllRefunds,getPaymentLogsByOrder, getReservations } from "../controllers/admin.controller.js";
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

router.get(
  "/reservations",
  protect,
  adminOnly,
  getReservations
);

router.get("/refunds", protect, adminOnly, getAllRefunds);


export default router;
