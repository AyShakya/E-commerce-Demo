import Order from "../models/Order.model.js";
import Product from "../models/Product.model.js";
import { isValidObjectId } from "../utils/isValidObject.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const ALLOWED_STATUSES = ["PENDING", "SHIPPED", "DELIVERED", "CANCELLED"];

// export const createOrder = asyncHandler(async (req, res) => {
//   const { items } = req.body;

//   if (!items?.length) {
//     return res.status(400).json({ message: "No items in order" });
//   }

//   let totalAmount = 0;
//   const orderItems = [];

//   for (const item of items) {
//     if (!isValidObjectId(item.productId)) {
//       return res.status(400).json({ message: "Invalid product id" });
//     }

//     const product = await Product.findOneAndUpdate(
//       {
//         _id: item.productId,
//         isActive: true,
//         quantity: { $gte: item.quantity },
//       },
//       { $inc: { quantity: -item.quantity } },
//       { new: true }
//     );

//     if (!product) {
//       return res.status(400).json({ message: "Product out of stock" });
//     }

//     totalAmount += product.price * item.quantity;

//     orderItems.push({
//       product: product._id,
//       title: product.title,
//       price: product.price,
//       quantity: item.quantity,
//     });
//   }

//   const order = await Order.create({
//     user: req.user.id,
//     items: orderItems,
//     totalAmount,
//   });

//   res.status(201).json(order);
// });

export const getMyOrders = asyncHandler(async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = 10;

  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments({ user: req.user.id }),
  ]);

  res.json({
    data: orders,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit),
    },
  });
});

export const getAllOrders = asyncHandler(async (req, res) => {
  const {
    search,
    paymentStatus,
    fulfillmentStatus,
    page = 1,
    limit = 10,
  } = req.query;

  const match = {};

  if (paymentStatus) match.paymentStatus = paymentStatus;
  if (fulfillmentStatus) match.fulfillmentStatus = fulfillmentStatus;

  const skip = (page - 1) * limit;

  const pipeline = [
    { $match: match },

    // 👤 User
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },

    // 💳 Payment (THIS FIXES REFUNDS)
    {
      $lookup: {
        from: "payments",
        localField: "_id",
        foreignField: "order",
        as: "payment",
      },
    },
    {
      $unwind: {
        path: "$payment",
        preserveNullAndEmptyArrays: true,
      },
    },
  ];

  // 🔍 Search by email / name / orderId
  if (search) {
    pipeline.push({
      $match: {
        $or: [
          { "user.email": { $regex: search, $options: "i" } },
          { "user.name": { $regex: search, $options: "i" } },
          { _id: { $regex: search, $options: "i" } },
        ],
      },
    });
  }

  pipeline.push(
    { $sort: { createdAt: -1 } },
    {
      $facet: {
        data: [{ $skip: skip }, { $limit: Number(limit) }],
        total: [{ $count: "count" }],
      },
    },
  );

  const result = await Order.aggregate(pipeline);

  const orders = result[0].data;
  const total = result[0].total[0]?.count || 0;

  res.json({
    data: orders,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    },
  });
});

export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.id,
    user: req.user.id,
  });

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  res.json(order);
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!ALLOWED_STATUSES.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  order.fulfillmentStatus = status;
  await order.save();

  res.json({
    message: "Order status updated",
    order,
  });
});

export const getOrdersByUser = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.params.userId }).sort(
    "-createdAt",
  );

  res.json(orders);
});

// export const cancelOrder = asyncHandler(async (req, res) => {
//   const order = await Order.findOne({
//     _id: req.params.id,
//     user: req.user.id,
//   });

//   if (!order) {
//     return res.status(404).json({ message: "Order not found" });
//   }

//   if (order.paymentStatus === "PAID") {
//     return res.status(400).json({ message: "Cannot cancel paid order" });
//   }

//   if (order.fulfillmentStatus !== "PENDING") {
//     return res.status(400).json({ message: "Order cannot be cancelled" });
//   }

//   for (const item of order.items) {
//     await Product.findByIdAndUpdate(item.product, {
//       $inc: { quantity: item.quantity },
//     });
//   }

//   order.fulfillmentStatus = "CANCELLED";
//   await order.save();

//   res.json({ message: "Order cancelled successfully" });
// });
