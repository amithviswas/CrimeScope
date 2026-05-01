/**
 * CrimeScope API Client
 * Axios instance with auth header injection and token refresh.
 */
import axios, { AxiosError, AxiosRequestConfig } from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const api = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  withCredentials: true,       // send httpOnly cookies
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor: inject Bearer token if present ─────────────────────

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ── Response interceptor: refresh token on 401 ──────────────────────────────

let _refreshing = false;
let _refreshQueue: Array<(token: string) => void> = [];

api.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const original = err.config as AxiosRequestConfig & { _retry?: boolean };
    if (
      err.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes("/auth/refresh")
    ) {
      original._retry = true;

      if (_refreshing) {
        return new Promise((resolve) => {
          _refreshQueue.push((token) => {
            if (original.headers) original.headers.Authorization = `Bearer ${token}`;
            resolve(api(original));
          });
        });
      }

      _refreshing = true;
      try {
        const res = await api.post("/auth/refresh");
        const newToken: string = res.data.access_token;
        localStorage.setItem("access_token", newToken);
        _refreshQueue.forEach((cb) => cb(newToken));
        _refreshQueue = [];
        if (original.headers) original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch {
        localStorage.removeItem("access_token");
        if (typeof window !== "undefined") window.location.href = "/login";
      } finally {
        _refreshing = false;
      }
    }
    return Promise.reject(err);
  }
);

// ── Typed API helpers ────────────────────────────────────────────────────────

export const authApi = {
  login:         (data: { email: string; password: string }) => api.post("/auth/login", data),
  register:      (data: { email: string; password: string; full_name: string }) => api.post("/auth/register", data),
  logout:        () => api.post("/auth/logout"),
  me:            () => api.get("/auth/me"),
  forgotPw:      (email: string) => api.post("/auth/forgot-password", { email }),
  resetPw:       (token: string, new_password: string) => api.post("/auth/reset-password", { token, new_password }),
};

export const crimesApi = {
  list:     (params?: object)          => api.get("/crimes", { params }),
  summary:  (params?: object)          => api.get("/crimes/stats/summary", { params }),
  byCategory: (params?: object)        => api.get("/crimes/stats/by-category", { params }),
  heatmap:  (params?: object)          => api.get("/crimes/heatmap", { params }),
  byTime:   (params?: object)          => api.get("/crimes/stats/by-time", { params }),
};

export const analyticsApi = {
  dashboard:      (params?: object) => api.get("/analytics/dashboard", { params }),
  trends:         (params?: object) => api.get("/analytics/trends", { params }),
  categoryBreak:  (params?: object) => api.get("/analytics/category-breakdown", { params }),
  topLocations:   (params?: object) => api.get("/analytics/top-locations", { params }),
  hourly:         (params?: object) => api.get("/analytics/hourly-pattern", { params }),
  weekly:         (params?: object) => api.get("/analytics/weekly-pattern", { params }),
};

export const mlApi = {
  hotspots:  (params?: object) => api.get("/ml/hotspots", { params }),
  forecast:  (params?: object) => api.get("/ml/forecast", { params }),
  anomalies: (params?: object) => api.get("/ml/anomalies", { params }),
};

export const paymentsApi = {
  plans:        () => api.get("/payments/plans"),
  subscription: () => api.get("/payments/subscription"),
  checkout:     (data: { plan: string; billing_cycle: string }) => api.post("/payments/checkout", data),
  portal:       () => api.post("/payments/portal"),
  cancel:       () => api.post("/payments/cancel"),
};

export const usersApi = {
  alerts:        () => api.get("/users/alerts"),
  createAlert:   (data: object) => api.post("/users/alerts", data),
  updateAlert:   (id: string, data: object) => api.patch(`/users/alerts/${id}`, data),
  deleteAlert:   (id: string) => api.delete(`/users/alerts/${id}`),
};
