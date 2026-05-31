import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    provider: {
      type: String,
      enum: ["RAZORPAY"],
      required: true,
    },

    /** Razorpay order_id */
    providerOrderId: {
      type: String,
    },

    /** Razorpay payment_id (after success) */
    providerPaymentId: {
      type: String,
    },

    amount: {
      type: Number,
      required: true, // rupees
    },

    refundedAmount: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: [
        "INITIATED",
        "PROCESSING",
        "SUCCESS",
        "FAILED",
        "PARTIALLY_REFUNDED",
        "REFUNDED",
        "DISPUTED",
      ],
      default: "INITIATED",
      index: true,
    },

    finalizationState: {
      type: String,
      enum: ["READY", "FINALIZING", "COMPLETED", "FAILED"],
      default: "READY",
      index: true,
    },

    finalizationLockedAt: {
      type: Date,
      default: null,
      index: true,
    },

    finalizationToken: {
      type: String,
      default: null,
      index: true,
    },

    finalizationAttempts: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ providerOrderId: 1 }, { unique: true, sparse: true });
paymentSchema.index({ providerPaymentId: 1 }, { unique: true, sparse: true });

export default mongoose.model("Payment", paymentSchema);
