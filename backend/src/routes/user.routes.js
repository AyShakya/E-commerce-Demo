import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  getMyProfile,
  updateMyAddress,
} from "../controllers/user.controller.js";

const router = express.Router();

/* Dashboard */
router.get("/me", protect, getMyProfile);
router.put("/me/address", protect, updateMyAddress);

export default router;
