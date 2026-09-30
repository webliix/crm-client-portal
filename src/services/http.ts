import axios from "axios";

const API_BASE_URL = "https://webliix-crm-backend.onrender.com";

export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("client_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect if 401 and not an explicit auth endpoint call
    if (error.response?.status === 401) {
      const url = error.config?.url || "";
      if (!url.includes("/login") && !url.includes("/register")) {
        console.warn("Session unauthorized or expired for client endpoint:", url);
      }
    }
    return Promise.reject(error);
  }
);
