"use client";

import type { ImageLoaderProps } from "next/image";

export function isSanityImage(src: string): boolean {
  return src.startsWith("https://cdn.sanity.io/images/");
}

/** Resize the existing Sanity crop, keeping its format negotiation and quality. */
export default function imageLoader({ src, width, quality }: ImageLoaderProps): string {
  if (!isSanityImage(src)) return src;

  const url = new URL(src);
  url.searchParams.set("w", String(width));
  url.searchParams.set("q", String(quality ?? url.searchParams.get("q") ?? 75));
  url.searchParams.set("auto", "format");
  // Never upscale a small original. The editor's rect/crop parameters stay intact.
  if (!url.searchParams.has("fit")) url.searchParams.set("fit", "max");
  return url.toString();
}
