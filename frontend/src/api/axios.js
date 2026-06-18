// axios.js
import axios from "axios";
import { refreshAccessToken } from "./auth.api";

const configuredBaseURL = import.meta.env.VITE_API_URL?.trim();
const isLocalhostBaseURL =
  !!configuredBaseURL && /localhost|127\.0\.0\.1/i.test(configuredBaseURL);
const apiBaseURL =
  import.meta.env.PROD && isLocalhostBaseURL ? undefined : configuredBaseURL;

if (import.meta.env.PROD && isLocalhostBaseURL) {
  console.warn(
    "VITE_API_URL points to localhost in production. Set it to the deployed backend URL in Vercel, or requests will fall back to the current origin.",
  );
}

const api = axios.create({
  baseURL: apiBaseURL,
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

const shouldSkipRefreshFlow = (url = "") =>
  url.includes("/auth/login") ||
  url.includes("/auth/register") ||
  url.includes("/auth/refresh");

/* ---------------- RESPONSE INTERCEPTOR ---------------- */

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!error.config) {
      return Promise.reject(error);
    }

    const originalRequest = error.config;

    if (shouldSkipRefreshFlow(originalRequest.url)) {
      return Promise.reject(error);
    }

    /* ✅ Only refresh on 401 (NOT 429, NOT network errors) */
    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        return Promise.reject(error);
      }

      /* 🛑 Hard stop if already tried */
      if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
        localStorage.removeItem("accessToken");
        window.dispatchEvent(new Event("auth-logout"));
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
        window.dispatchEvent(new Event("auth-logout"));
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
