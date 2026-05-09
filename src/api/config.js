const LOCAL_API_URL = "http://localhost:5000/api";

function normalizeApiUrl(url) {
  const fallback = LOCAL_API_URL;
  const raw = (url || fallback).trim().replace(/\/+$/, "");

  if (!raw) return fallback;
  return raw.endsWith("/api") ? raw : `${raw}/api`;
}

export const API_BASE_URL = normalizeApiUrl(
  import.meta.env.DEV ? LOCAL_API_URL : import.meta.env.VITE_API_URL
);

export async function parseJsonResponse(res, fallbackMessage) {
  const contentType = res.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    const body = await res.text().catch(() => "");
    const preview = body.trim().slice(0, 80);
    throw new Error(
      `${fallbackMessage}. Expected JSON from ${res.url}, but received ${
        contentType || "an unknown content type"
      }${preview ? `: ${preview}` : ""}`
    );
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || fallbackMessage);
  return data;
}
