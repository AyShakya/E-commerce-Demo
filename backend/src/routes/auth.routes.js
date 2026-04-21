import express from "express";
import { login, logout, refreshAccessToken, register } from "../controllers/auth.controller.js";
import { authLimiter } from "../utils/ratelimiter.js";

const router = express.Router();

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/logout", authLimiter, logout);

router.post("/refresh", refreshAccessToken);

export default router;
