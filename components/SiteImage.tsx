"use client";

import Image, { type ImageProps } from "next/image";
import { isSanityImage } from "@/lib/image-loader";

/** Only Sanity URLs support resizing; local artwork and review avatars stay as-is. */
export default function SiteImage({ src, unoptimized, ...props }: ImageProps) {
  const responsive = typeof src === "string" && isSanityImage(src);
  return <Image {...props} src={src} unoptimized={!responsive || unoptimized} />;
}
