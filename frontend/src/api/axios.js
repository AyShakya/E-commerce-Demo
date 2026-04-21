// axios.js
import axios from "axios";
import { refreshAccessToken } from "./auth.api";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ---------------- REFRESH CONTROL ---------------- */

let isRefreshing = false;
let failedQueue = [];
let refreshAttempts = 0;
const MAX_REFRESH_ATTEMPTS = 1;

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

/* ---------------- RESPONSE INTERCEPTOR ---------------- */

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!error.config) {
      return Promise.reject(error);
    }

    const originalRequest = error.config;

    /* ❌ If refresh itself fails → hard logout */
    if (originalRequest.url?.includes("/auth/refresh")) {
      localStorage.removeItem("accessToken");
      window.location.href = "/login";
      return Promise.reject(error);
    }

    /* ✅ Only refresh on 401 (NOT 429, NOT network errors) */
    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      /* 🛑 Hard stop if already tried */
      if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
        return Promise.reject(error);
      }

      /* ⏳ If refresh already in progress, queue the request */
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      refreshAttempts++;

      try {
        const { accessToken } = await refreshAccessToken();

        /* ✅ Refresh succeeded */
        localStorage.setItem("accessToken", accessToken);
        api.defaults.headers.Authorization = `Bearer ${accessToken}`;

        processQueue(null, accessToken);
        refreshAttempts = 0; // reset on success

        return api(originalRequest);
      } catch (err) {
        /* ❌ Refresh failed → logout */
        processQueue(err, null);
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
