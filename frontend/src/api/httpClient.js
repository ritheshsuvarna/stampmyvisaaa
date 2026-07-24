import axios from "axios";

// In dev, Vite proxies /api -> http://localhost:4000 (vite.config.js).
// In production the frontend and backend deploy separately (Vercel +
// Railway/Render), so VITE_API_BASE_URL must point at the deployed API.
const baseURL = import.meta.env.VITE_API_BASE_URL || "/api";

export const httpClient = axios.create({
  baseURL,
  timeout: 15000,
});

// A true network error (no response at all) means the backend is
// unreachable. In local dev, Vite's /api proxy adds a wrinkle: when the
// backend process is down, the proxy itself answers with a 502/503/504 —
// but with a plain-text/HTML body, not our API's `{ error: { code } }`
// shape — rather than letting the connection fail outright. We only treat
// those gateway statuses as "unreachable" when the body isn't a real API
// error, so a legitimate backend-returned 503 (e.g. "AI not configured")
// still surfaces as itself instead of being mistaken for downtime.
const GATEWAY_STATUSES = new Set([502, 503, 504]);

export function isNetworkError(err) {
  if (!err?.response) return true;
  return GATEWAY_STATUSES.has(err.response.status) && !err.response.data?.error?.code;
}

export function apiErrorMessage(err, fallback = "Something went wrong.") {
  return err?.response?.data?.error?.message || fallback;
}
