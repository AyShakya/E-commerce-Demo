import Product from "../models/Product.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { isValidObjectId } from "../utils/isValidObject.js";

export const createProduct = asyncHandler(async (req, res) => {
  const images = req.files.map((file) => file.path);

  const product = await Product.create({ ...req.body, images });
  res.status(201).json(product);
});

export const getAllProducts = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    tags,
    sort = "newest",
    page = 1,
    limit = 12,
  } = req.query;

  const query = { isActive: true };

  /* 🔍 SEARCH (title + description + tags via text index) */
  if (search) {
    const words = search
      .trim()
      .split(/\s+/)
      .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

    query.$and = words.map((word) => ({
      $or: [
        { title: { $regex: word, $options: "i" } },
        { description: { $regex: word, $options: "i" } },
      ],
    }));
  }

  /* 🗂 CATEGORY */
  if (category) {
    query.category = category;
  }

  /* 🏷 TAGS (normalized) */
  if (tags) {
    query.tags = {
      $in: tags.split(",").map((t) => t.trim().toLowerCase()),
    };
  }

  /* 🔃 SORTING */
  const sortMap = {
    newest: { createdAt: -1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
  };

  // If using text search, sort by relevance first
  const sortBy = sortMap[sort] || sortMap.newest;

  const skip = (Number(page) - 1) * Number(limit);

  const [products, total] = await Promise.all([
    Product.find(query).sort(sortBy).skip(skip).limit(Number(limit)),
    Product.countDocuments(query),
  ]);

  res.json({
    data: products,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
      hasMore: skip + products.length < total,
    },
  });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const updateData = { ...req.body };

  if (req.files?.length) {
    updateData.images = req.files.map((file) => file.path);
  }

  const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
  });

  res.json(product);
});

export const deleteProduct = asyncHandler(async (req, res) => {
  await Product.findByIdAndUpdate(req.params.id, { isActive: false });
  res.status(204).send();
});

export const restoreProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { isActive: true },
    { new: true },
  );

  res.json(product);
});

export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findOne({
    _id: req.params.id,
    isActive: true,
  });

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  res.json(product);
});

export const bulkUpdateProducts = asyncHandler(async (req, res) => {
  const { productIds, mode, value } = req.body;

  /* VALIDATION */
  if (!Array.isArray(productIds) || productIds.length === 0) {
    return res.status(400).json({ message: "No products selected" });
  }

  if (!["DISCOUNT", "SET_PRICE"].includes(mode)) {
    return res.status(400).json({ message: "Invalid bulk action mode" });
  }

  if (typeof value !== "number" || value <= 0) {
    return res.status(400).json({ message: "Invalid value" });
  }

  const validIds = productIds.filter(isValidObjectId);

  if (validIds.length === 0) {
    return res.status(400).json({ message: "Invalid product IDs" });
  }

  /* FETCH PRODUCTS */
  const products = await Product.find({
    _id: { $in: validIds },
    isActive: true,
  });

  if (products.length === 0) {
    return res.status(404).json({ message: "No active products found" });
  }

  /* APPLY BULK LOGIC */
  const updates = products.map((product) => {
    let newPrice = product.price;

    if (mode === "DISCOUNT") {
      newPrice = Math.max(
        1,
        Math.round(product.price - (product.price * value) / 100),
      );
    }

    if (mode === "SET_PRICE") {
      newPrice = Math.round(value);
    }

    return {
      updateOne: {
        filter: { _id: product._id },
        update: { $set: { price: newPrice } },
      },
    };
  });

  /* EXECUTE BULK UPDATE */
  await Product.bulkWrite(updates);

  res.json({
    message: "Bulk update successful",
    updatedCount: updates.length,
  });
});

export const getAdminProducts = asyncHandler(async (req, res) => {
  const { search = "", isActive = "true", page = 1, limit = 10 } = req.query;

  const query = {
    isActive: isActive === "true",
  };

  if (search) {
    const words = search
      .trim()
      .split(/\s+/)
      .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

    query.$and = words.map((word) => ({
      $or: [
        { title: { $regex: word, $options: "i" } },
        { description: { $regex: word, $options: "i" } },
      ],
    }));
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [products, total] = await Promise.all([
    Product.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Product.countDocuments(query),
  ]);

  res.json({
    data: products,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
      hasMore: skip + products.length < total,
    },
  });
});
