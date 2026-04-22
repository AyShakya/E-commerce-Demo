import api from "./axios";

export const createPayment = async ({ productId, quantity }) => {
  const res = await api.post("/payments/create", {
    productId,
    quantity,
  });
  return res.data;
};

export const getCheckoutStatus = async (productId) => {
  const res = await api.get("/payments/checkout-status", {
    params: { productId },
  });
  return res.data;
};

export const cancelCheckout = async ({ productId, reservationId }) => {
  const res = await api.post("/payments/cancel", {
    productId,
    reservationId,
  });
  return res.data;
};

export const verifyPayment = async ({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
}) => {
  const res = await api.post("/payments/verify", {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  });
  return res.data;
};

