import mongoose from "mongoose";

const refundSchema = new mongoose.Schema(
  {
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      required: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true, // rupees
    },

    providerRefundId: {
      type: String,
      index: true,
    },

    status: {
      type: String,
      enum: ["REQUESTED", "PROCESSING", "COMPLETED", "FAILED"],
      default: "REQUESTED",
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Refund", refundSchema);
