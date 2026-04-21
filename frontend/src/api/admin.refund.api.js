import api from "./axios";

export const fetchAdminRefunds = async ({
  page = 1,
  limit = 20,
  status = "",
} = {}) => {
  const params = new URLSearchParams();
  params.set("page", page);
  params.set("limit", limit);
  if (status) params.set("status", status);

  const res = await api.get(`/admin/refunds?${params.toString()}`);
  return res.data; // { data, pagination }
};
