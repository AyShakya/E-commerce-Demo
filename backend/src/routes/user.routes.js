import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  getMyProfile,
  updateMyAddress,
} from "../controllers/user.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { addressSchema } from "../middlewares/validation.schemas.js";

const router = express.Router();

/* Dashboard */
router.get("/me", protect, getMyProfile);
router.put("/me/address", protect, validate(addressSchema), updateMyAddress);

export default router;
