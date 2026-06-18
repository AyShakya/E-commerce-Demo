import Order from "../models/Order.model.js";
import Payment from "../models/Payment.model.js";
import Refund from "../models/Refund.model.js";
import PaymentLog from "../models/PaymentLog.model.js";
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
      .limit(limit)
      .populate("payment", "providerPaymentId providerOrderId amount createdAt"),
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

  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  const skip = (pageNumber - 1) * limitNumber;

  const match = {};

  if (paymentStatus) match.paymentStatus = paymentStatus;
  if (fulfillmentStatus) match.fulfillmentStatus = fulfillmentStatus;

  const pipeline = [{ $match: match }];

  pipeline.push({
    $lookup: {
      from: "users",
      let: { userId: "$user" },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ["$_id", "$$userId"] },
          },
        },
        {
          $project: {
            name: 1,
            email: 1,
            phone: 1,
          },
        },
      ],
      as: "user",
    },
  });

  pipeline.push({
    $unwind: {
      path: "$user",
      preserveNullAndEmptyArrays: true,
    },
  });

  if (search) {
    const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    pipeline.push({
      $match: {
        $or: [
          { "user.email": { $regex: escapedSearch, $options: "i" } },
          { "user.name": { $regex: escapedSearch, $options: "i" } },
          { "items.title": { $regex: escapedSearch, $options: "i" } },
          {
            $expr: {
              $regexMatch: {
                input: { $toString: "$_id" },
                regex: escapedSearch,
                options: "i",
              },
            },
          },
        ],
      },
    });
  }

  const countPipeline = [...pipeline, { $count: "count" }];

  const dataPipeline = [
    ...pipeline,
    {
      $project: {
        user: 1,
        items: 1,
        totalAmount: 1,
        paymentStatus: 1,
        fulfillmentStatus: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: limitNumber },
  ];

  const [dataResult, countResult] = await Promise.all([
    Order.aggregate(dataPipeline),
    Order.aggregate(countPipeline),
  ]);

  const orders = dataResult;
  const total = countResult[0]?.count || 0;

  res.json({
    data: orders,
    pagination: {
      total,
      page: pageNumber,
      pages: Math.ceil(total / limitNumber),
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

export const getAdminOrderDetail = asyncHandler(async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid order ID" });
  }

  const order = await Order.findById(req.params.id)
    .populate("user", "name email phone")
    .populate({ path: "payment" })
    .lean();

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  const payment =
    order.payment ||
    (await Payment.findOne({ order: order._id })
      .select(
        "amount refundedAmount status providerOrderId providerPaymentId finalizationState order createdAt updatedAt",
      )
      .lean());

  const [paymentLogs, refunds] = await Promise.all([
    PaymentLog.find({ order: order._id })
      .sort({ createdAt: -1 })
      .select("eventType providerRef amount metadata createdAt")
      .lean(),
    payment
      ? Refund.find({ payment: payment._id })
          .sort({ createdAt: -1 })
          .select("amount status providerRefundId createdAt updatedAt")
          .lean()
      : Promise.resolve([]),
  ]);

  return res.json({
    order,
    payment,
    paymentLogs,
    refunds,
  });
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
