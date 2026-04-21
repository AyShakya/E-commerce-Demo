import express from "express";
import { protect, adminOnly } from "../middlewares/auth.middleware.js";
import { createPayment, refundPayment } from "../controllers/payment.controller.js";
import { razorpayWebhook } from "../controllers/webhook.controller.js";
import { paymentLimiter } from "../utils/ratelimiter.js";

const router = express.Router();

router.post("/webhook", razorpayWebhook);

router.post("/create", protect, paymentLimiter, createPayment);
router.post("/refund", protect, adminOnly, paymentLimiter, refundPayment);

export default router;
