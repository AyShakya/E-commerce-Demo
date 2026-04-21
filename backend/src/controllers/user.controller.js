import User from "../models/User.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select(
    "name email role address createdAt"
  );

  res.json(user);
});

const REQUIRED_FIELDS = ["fullName", "phone", "line1", "city", "state", "postalCode"];

const isValidPhone = (value = "") => /^\+?[0-9\s()-]{7,20}$/.test(value.trim());
const isValidPostalCode = (value = "") => /^[A-Za-z0-9\s-]{3,12}$/.test(value.trim());

export const updateMyAddress = asyncHandler(async (req, res) => {
  const payload = {
    fullName: String(req.body.fullName || "").trim(),
    phone: String(req.body.phone || "").trim(),
    line1: String(req.body.line1 || "").trim(),
    line2: String(req.body.line2 || "").trim(),
    city: String(req.body.city || "").trim(),
    state: String(req.body.state || "").trim(),
    postalCode: String(req.body.postalCode || "").trim(),
    country: String(req.body.country || "India").trim() || "India",
  };

  const missingFields = REQUIRED_FIELDS.filter((field) => !payload[field]);
  if (missingFields.length) {
    return res.status(400).json({
      message: "Please complete all required address fields",
      errors: missingFields,
    });
  }

  if (!isValidPhone(payload.phone)) {
    return res.status(400).json({
      message: "Please enter a valid phone number",
      errors: ["phone"],
    });
  }

  if (!isValidPostalCode(payload.postalCode)) {
    return res.status(400).json({
      message: "Please enter a valid postal code",
      errors: ["postalCode"],
    });
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { address: payload },
    {
      new: true,
      runValidators: true,
    }
  ).select("address");

  res.json({
    message: "Address updated successfully",
    address: user.address,
  });
});
