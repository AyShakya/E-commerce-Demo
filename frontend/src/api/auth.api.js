import api from "./axios";

export const loginUser = async (data) => {
  const res = await api.post("/auth/login", data);
  return res.data;
};

export const registerUser = async (data) => {
  const res = await api.post("/auth/register", data);
  return res.data;
};

export const logoutUser = async () => {
  await api.post("/auth/logout");
};

export const getMyProfile = async () => {
  const res = await api.get("/users/me");
  return res.data;
};

export const refreshAccessToken = async () => {
  const res = await api.post("/auth/refresh");
  return res.data;
};

