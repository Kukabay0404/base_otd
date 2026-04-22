const rawBaseUrl =
  typeof window === "undefined"
    ? process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL
    : process.env.NEXT_PUBLIC_BACKEND_URL ?? process.env.BACKEND_URL;

if (!rawBaseUrl && process.env.NODE_ENV !== "production") {
  console.warn(
    "API base URL is not configured. Set NEXT_PUBLIC_BACKEND_URL and optionally BACKEND_URL in frontend/.env.local",
  );
}

export const API_BASE_URL = (rawBaseUrl ?? "").replace(/\/$/, "");

export function apiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}
