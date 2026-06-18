import express from "express";
import { login, logout, refreshAccessToken, register } from "../controllers/auth.controller.js";
import { authLimiter } from "../utils/ratelimiter.js";
import { validate } from "../middlewares/validate.middleware.js";
import { registerSchema, loginSchema } from "../middlewares/validation.schemas.js";

const router = express.Router();

router.post("/register", authLimiter, validate(registerSchema), register);
router.post("/login", authLimiter, validate(loginSchema), login);
router.post("/logout", authLimiter, logout);

router.post("/refresh", authLimiter, refreshAccessToken);

export default router;
