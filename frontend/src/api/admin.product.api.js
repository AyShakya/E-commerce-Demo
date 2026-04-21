import api from "./axios";

export const createProduct = async (formData) => {
  const res = await api.post("/admin/products", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const updateProduct = async (id, formData) => {
  const res = await api.put(`/admin/products/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const fetchAllProducts = async ({
  search = "",
  isActive = true,
  page = 1,
  limit = 50,
} = {}) => {
  const params = new URLSearchParams();

  params.set("page", page);
  params.set("limit", limit);
  params.set("isActive", String(isActive));

  if (search) params.set("search", search);

  const res = await api.get(`/admin/products?${params.toString()}`);
  return res.data;
};

export const deleteProduct = async (id) => {
  await api.delete(`/admin/products/${id}`);
};

export const restoreProduct = async (id) => {
  await api.patch(`/admin/products/${id}/restore`);
};

export const bulkUpdateProducts = async (payload) => {
  const res = await api.post("/admin/products/bulk", payload);
  return res.data;
};
