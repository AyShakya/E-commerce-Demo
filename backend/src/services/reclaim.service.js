import Reservation from "../models/Reservation.model.js";
import Product from "../models/Product.model.js";
import { logPaymentEvent } from "./paymentAudit.service.js";

/**
 * Reclaims stock from expired reservations.
 * @param {string} productId - Optional. If provided, only reclaims for that product.
 * @returns {number} - Number of items reclaimed.
 */
export const reclaimExpiredStock = async (productId = null) => {
  try {
    const query = {
      status: "ACTIVE",
      expiresAt: { $lt: new Date() },
    };

    if (productId) {
      query.product = productId;
    }

    const expiredReservations = await Reservation.find(query);

    if (expiredReservations.length === 0) return 0;

    let reclaimedTotal = 0;

    for (const res of expiredReservations) {
      // Use findOneAndUpdate to ensure we don't double-process in a race condition
      const updated = await Reservation.findOneAndUpdate(
        { _id: res._id, status: "ACTIVE" },
        { $set: { status: "EXPIRED" } },
        { new: true }
      );

      if (updated) {
        await Product.findByIdAndUpdate(updated.product, {
          $inc: { quantity: updated.quantity },
        });

        await logPaymentEvent({
          user: updated.user,
          eventType: "AUTO_RECLAIMED",
          metadata: {
            reservationId: updated._id,
            productId: updated.product,
            quantity: updated.quantity,
          },
        });
        reclaimedTotal += updated.quantity;
      }
    }

    return reclaimedTotal;
  } catch (error) {
    console.error("[Reclaim Utility] Error during reclamation:", error);
    return 0;
  }
};
