import api from "./axios";

export const fetchAdminOrders = async ({
  page = 1,
  limit = 10,
  search = "",
  paymentStatus = "",
  fulfillmentStatus = "",
} = {}) => {
  const params = new URLSearchParams();

  params.set("page", page);
  params.set("limit", limit);

  if (search) params.set("search", search);
  if (paymentStatus) params.set("paymentStatus", paymentStatus);
  if (fulfillmentStatus) params.set("fulfillmentStatus", fulfillmentStatus);

  const res = await api.get(`/admin/orders?${params.toString()}`);
  return res.data; // { data, pagination }
};

export const updateOrderStatus = async (orderId, status) => {
  const res = await api.patch(`/admin/orders/${orderId}/status`, {
    status,
  });
  return res.data;
};