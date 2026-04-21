import mongoose from "mongoose";

const paymentLogSchema = new mongoose.Schema(
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
      index: true,
    },

    eventType: {
      type: String,
      enum: [
        "PAYMENT_INTENT_CREATED",
        "PAYMENT_SUCCESS",
        "PAYMENT_FAILED",
        "REFUND_REQUESTED",
        "REFUND_SUCCESS",
        "REFUND_FAILED",
        "DISPUTE_OPENED",
        "DISPUTE_CLOSED",
      ],
      required: true,
    },

    provider: {
      type: String,
      enum: ["RAZORPAY"],
      default: "RAZORPAY",
    },

    providerRef: {
      type: String, // razorpay order_id / payment_id / refund_id / dispute_id
    },

    amount: {
      type: Number, // in rupees (store normalized)
    },

    metadata: {
      type: Object, // raw payload / error / notes
    },
  },
  { timestamps: true }
);

paymentLogSchema.index({ order: 1, createdAt: -1 });
paymentLogSchema.index({ eventType: 1 });

export default mongoose.model("PaymentLog", paymentLogSchema);
