import api from "./axios";

export const fetchAdminLogs = async ({
  page = 1,
  limit = 25,
  eventType = "",
  orderId = "",
  userId = "",
} = {}) => {
  const params = new URLSearchParams();

  params.set("page", page);
  params.set("limit", limit);

  if (eventType) params.set("eventType", eventType);
  if (orderId) params.set("orderId", orderId);
  if (userId) params.set("userId", userId);

  const res = await api.get(`/admin/logs?${params.toString()}`);
  return res.data;
};