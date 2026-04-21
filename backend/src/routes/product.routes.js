import express from "express";
import {
  createProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
  restoreProduct,
  getProductById,
  bulkUpdateProducts,
  getAdminProducts,
} from "../controllers/product.controller.js";

import { protect, adminOnly } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

/* Public */
router.get("/products", getAllProducts);

/* Admin */
router.post("/admin/products", protect, adminOnly, upload.array("images", 5), createProduct);
router.put("/admin/products/:id", protect, adminOnly, upload.array("images", 5), updateProduct);
router.delete("/admin/products/:id", protect, adminOnly, deleteProduct);
router.patch("/admin/products/:id/restore", protect, adminOnly, restoreProduct);
router.get("/products/:id", getProductById);
router.post(
  "/admin/products/bulk",
  protect,
  adminOnly,
  bulkUpdateProducts
);
router.get(
  "/admin/products",
  protect,
  adminOnly,
  getAdminProducts
);

export default router;
