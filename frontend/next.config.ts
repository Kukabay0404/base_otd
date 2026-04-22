import type { NextConfig } from "next";

const baseDomains = [
  "mir-s3-cdn-cf.behance.net",
  "static.tildacdn.com",
  "i.pinimg.com",
  "st.hzcdn.com",
  "elles.top",
];

const mediaBaseUrl = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;
let mediaDomain: string | null = null;
if (mediaBaseUrl) {
  try {
    mediaDomain = new URL(mediaBaseUrl).hostname;
  } catch {
    mediaDomain = null;
  }
}

const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
  { protocol: "https", hostname: "**.r2.dev" },
];
if (mediaDomain) {
  remotePatterns.push({ protocol: "https", hostname: mediaDomain });
}

const nextConfig: NextConfig = {
  images: {
    domains: [...new Set([...baseDomains, ...(mediaDomain ? [mediaDomain] : [])])],
    remotePatterns,
  },
};

export default nextConfig;
