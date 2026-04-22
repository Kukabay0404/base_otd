const mediaBaseUrl = (process.env.NEXT_PUBLIC_MEDIA_BASE_URL ?? "").replace(/\/$/, "");
const fallbackImage =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800">
      <rect width="1200" height="800" fill="#e5efe5" />
      <rect x="60" y="60" width="1080" height="680" rx="32" fill="#d5e4d2" />
      <path d="M180 590L420 360l150 145 180-200 270 285H180z" fill="#88a97d" />
      <circle cx="900" cy="240" r="72" fill="#f5d38d" />
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
        font-family="Arial, sans-serif" font-size="44" fill="#355e3b">
        Media URL is not configured
      </text>
    </svg>
  `);

export function mediaUrlFromKey(key: string): string {
  if (!mediaBaseUrl) return fallbackImage;
  return `${mediaBaseUrl}/${key.replace(/^\/+/, "")}`;
}

export function resolveMediaUrl(path?: string): string {
  if (!path) return fallbackImage;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/")) return path;
  return mediaUrlFromKey(path);
}
