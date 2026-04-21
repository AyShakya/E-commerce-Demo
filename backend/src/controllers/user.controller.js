import User from "../models/User.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select(
    "name email role address createdAt"
  );

  res.json(user);
});

export const updateMyAddress = asyncHandler(async (req, res) => {
  const {
    fullName,
    phone,
    line1,
    line2,
    city,
    state,
    postalCode,
    country,
  } = req.body;

  if (!fullName || !phone || !line1 || !city || !state || !postalCode) {
    return res.status(400).json({ message: "Incomplete address" });
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      address: {
        fullName,
        phone,
        line1,
        line2,
        city,
        state,
        postalCode,
        country: country || "India",
      },
    },
    { new: true }
  ).select("address");

  res.json({
    message: "Address updated successfully",
    address: user.address,
  });
});
