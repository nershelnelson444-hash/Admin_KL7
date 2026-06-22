import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";

// Toggle: the project ships fully wired to a mock in-memory data layer so it
// runs standalone with zero backend. Flip VITE_USE_MOCK_API=false once a real
// API is available — every service in src/services already calls this client
// with the final REST shape, so no call-site changes are needed.
export const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API !== "false";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("kl7_auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("kl7_auth_token");
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);
