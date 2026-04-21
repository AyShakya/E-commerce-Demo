import mongoose from "mongoose";
import { PRODUCT_CATEGORIES } from "../utils/categories.js";

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },

    discountPrice: {
      type: Number,
      min: 0,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
    },

    images: [
      {
        type: String,
      },
    ],

    category: {
      type: String,
      enum: PRODUCT_CATEGORIES,
      required: true,
    },

    tags: [
      {
        type: String,
        lowercase: true,
        trim: true,
        index: true,
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ tags: 1, isActive: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ title: 1 });
productSchema.index({ description: 1 });
productSchema.index({ isActive: 1, createdAt: -1 });

export default mongoose.model("Product", productSchema);
