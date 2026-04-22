import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { connectDB } from "./src/config/mongoDB.js";
import { startReservationCleanupJob } from "./src/workers/reservationCleanup.job.js";

const PORT = process.env.PORT || 5000;
let reservationJobTimer = null;

const startServer = async () => {
  try {
    await connectDB();
    reservationJobTimer = startReservationCleanupJob({
      intervalMs: Number(process.env.RESERVATION_CLEANUP_INTERVAL_MS || 120000),
      runOnBoot: true,
    });

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server failed to start:", error);
    process.exit(1);
  }
};

startServer();

process.on("SIGTERM", () => {
  if (reservationJobTimer) clearInterval(reservationJobTimer);
});

process.on("SIGINT", () => {
  if (reservationJobTimer) clearInterval(reservationJobTimer);
});