import api from "./axios";

export const createPayment = async ({ productId, quantity }) => {
  const res = await api.post("/payments/create", {
    productId,
    quantity,
  });
  return res.data;
};

