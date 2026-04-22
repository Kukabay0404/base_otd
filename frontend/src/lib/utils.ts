import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { resolveMediaUrl } from "@/lib/media";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeImagePath(path?: string) {
  return resolveMediaUrl(path);
}
