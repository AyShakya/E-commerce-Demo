import api from "./axios";

export const fetchProducts = async ({
  page = 1,
  limit = 12,
  search = "",
  category = "",
  tags = [],
  sort = "newest",
} = {}) => {
  const params = new URLSearchParams();

  params.set("page", page);
  params.set("limit", limit);
  params.set("sort", sort);

  if (search) params.set("search", search);
  if (category) params.set("category", category);
  if (tags.length) params.set("tags", tags.join(","));

  const res = await api.get(`/products?${params.toString()}`);
  return res.data; // { data, pagination }
};

export const fetchProductById = async (id) => {
  const res = await api.get(`/products/${id}`);
  return res.data;
};
