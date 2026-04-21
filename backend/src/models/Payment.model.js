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
      index: true,
    },

    /** Razorpay payment_id (after success) */
    providerPaymentId: {
      type: String,
      index: true,
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
  },
  { timestamps: true }
);

paymentSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model("Payment", paymentSchema);
