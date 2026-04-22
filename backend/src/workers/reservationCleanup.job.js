import { reclaimExpiredStock } from "../services/reclaim.service.js";

const DEFAULT_INTERVAL_MS = 2 * 60 * 1000;

export const startReservationCleanupJob = ({
  intervalMs = DEFAULT_INTERVAL_MS,
  runOnBoot = true,
} = {}) => {
  const execute = async () => {
    try {
      const reclaimed = await reclaimExpiredStock();
      if (reclaimed > 0) {
        console.log(`[Reservation Job] Auto-reclaimed ${reclaimed} items`);
      }
    } catch (err) {
      console.error("[Reservation Job] Cleanup failed", err);
    }
  };

  if (runOnBoot) {
    // Run in background on boot
    execute();
  }

  const timer = setInterval(execute, intervalMs);
  return timer;
};
