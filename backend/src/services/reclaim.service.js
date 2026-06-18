import Reservation from "../models/Reservation.model.js";
import Product from "../models/Product.model.js";
import Payment from "../models/Payment.model.js";
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

    const results = await Promise.all(
      expiredReservations.map(async (res) => {
        try {
          const updated = await Reservation.findOneAndUpdate(
            { _id: res._id, status: "ACTIVE" },
            { $set: { status: "EXPIRED" } },
            { new: true }
          );

          if (updated) {
            await Product.findByIdAndUpdate(updated.product, {
              $inc: { quantity: updated.quantity },
            });

            if (updated.payment) {
              await Payment.findByIdAndUpdate(updated.payment, {
                $set: { status: "FAILED" },
              });
            }

            await logPaymentEvent({
              user: updated.user,
              eventType: "AUTO_RECLAIMED",
              metadata: {
                reservationId: updated._id,
                productId: updated.product,
                quantity: updated.quantity,
              },
            });
            return updated.quantity;
          }
        } catch (err) {
          console.error("[Reclaim Utility] Error restocking reservation:", res._id, err);
        }
        return 0;
      })
    );

    const reclaimedTotal = results.reduce((sum, qty) => sum + qty, 0);

    return reclaimedTotal;
  } catch (error) {
    console.error("[Reclaim Utility] Error during reclamation:", error);
    return 0;
  }
};
