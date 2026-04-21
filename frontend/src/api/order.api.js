import api from "./axios";

export const getOrderById = async (orderId) => {
  const res = await api.get(`/orders/${orderId}`);
  return res.data;
};

export const getMyOrders = async ({ page = 1 } = {}) => {
  const res = await api.get(`/orders/my?page=${page}`);
  return res.data; // { data, pagination }
};
