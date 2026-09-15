import axios from "axios";
import { clearAuthToken, getAuthToken } from "./auth";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    config.headers.delete("Content-Type");
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthToken();
      if (typeof window !== "undefined" && !["/signin", "/signup"].includes(window.location.pathname)) {
        // Axios interceptors run outside a React component, so the router is unavailable here.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = "/signin";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
