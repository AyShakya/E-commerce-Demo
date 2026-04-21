import mongoose from "mongoose";
import dotenv from "dotenv";
import Reservation from "../models/Reservation.model.js";
import Product from "../models/Product.model.js";

dotenv.config();

const INTERVAL_MS = 2 * 60 * 1000;

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Reservation worker connected to MongoDB");
};

const runCleanup = async () => {
  const now = new Date();

  const expired = await Reservation.find({
    status: "ACTIVE",
    expiresAt: { $lt: now },
  }).limit(50);

  let cleaned = 0;

  for (const reservation of expired) {
    // 🔒 Atomic status transition
    const updated = await Reservation.findOneAndUpdate(
      {
        _id: reservation._id,
        status: "ACTIVE",
      },
      {
        $set: { status: "EXPIRED" },
      },
      { new: true }
    );

    if (!updated) continue;

    // 🔄 Restore stock
    await Product.findByIdAndUpdate(
      reservation.product,
      { $inc: { quantity: reservation.quantity } }
    );

    cleaned++;
  }

  if (cleaned > 0) {
    console.log(`[Reservation Worker] Expired ${cleaned} reservations`);
  }
};

const start = async () => {
  try {
    await connectDB();

    // Run immediately on boot
    await runCleanup();

    // Then every 2 minutes
    setInterval(runCleanup, INTERVAL_MS);
  } catch (err) {
    console.error("Reservation worker failed", err);
    process.exit(1);
  }
};

process.on("SIGTERM", async () => {
  console.log("Reservation worker shutting down");
  await mongoose.disconnect();
  process.exit(0);
});

start();
