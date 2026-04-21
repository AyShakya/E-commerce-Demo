import User from "../models/User.model.js";
import Product from "../models/Product.model.js";

/* GET CART */
export const getCart = async (req, res) => {
  const user = await User.findById(req.user.id).populate(
    "cart.product",
    "title price images quantity"
  );

  res.json(user.cart);
};

/* ADD TO CART */
export const addToCart = async (req, res) => {
  const { productId, quantity } = req.body;

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    return res.status(404).json({ message: "Product not available" });
  }

  const user = await User.findById(req.user.id);

  const existing = user.cart.find(
    (item) => item.product.toString() === productId
  );

  if (existing) {
    existing.quantity += quantity;
  } else {
    user.cart.push({ product: productId, quantity });
  }

  await user.save();
  res.json(user.cart);
};

/* UPDATE QUANTITY */
export const updateCartItem = async (req, res) => {
  const { productId, quantity } = req.body;

  const user = await User.findById(req.user.id);

  const item = user.cart.find(
    (i) => i.product.toString() === productId
  );

  if (!item) {
    return res.status(404).json({ message: "Item not found" });
  }

  item.quantity = quantity;
  await user.save();

  res.json(user.cart);
};

/* REMOVE ITEM */
export const removeCartItem = async (req, res) => {
  const user = await User.findById(req.user.id);

  user.cart = user.cart.filter(
    (i) => i.product.toString() !== req.params.productId
  );

  await user.save();
  res.json(user.cart);
};

/* CLEAR CART */
export const clearCart = async (req, res) => {
  const user = await User.findById(req.user.id);
  user.cart = [];
  await user.save();
  res.json([]);
};
