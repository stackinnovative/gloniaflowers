"use client";

import Image, { type ImageProps } from "next/image";
import { preload as preloadResource } from "react-dom";
import staticImages from "@/data/static-images.json";
import { isSanityImage } from "@/lib/image-loader";

type StaticVariant = { width: number; height: number; src: string };
const artwork: Record<string, StaticVariant[]> = staticImages;

function StaticImage({ src, preload, priority, loading, sizes, ...props }: ImageProps & { src: string }) {
  const variants = artwork[src];
  const srcSet = variants.map((variant) => `${variant.src} ${variant.width}w`).join(", ");
  const imageSizes = sizes ?? (props.width ? `${props.width}px` : "100vw");
  const fallback = variants[variants.length - 1].src;

  // Match the picture's candidates so preloading cannot fetch a second, full-size logo.
  if (preload || priority) {
    preloadResource(fallback, {
      as: "image",
      type: "image/webp",
      imageSrcSet: srcSet,
      imageSizes,
      fetchPriority: props.fetchPriority,
      crossOrigin: props.crossOrigin,
      referrerPolicy: props.referrerPolicy,
    });
  }

  return (
    <picture className="contents">
      <source className="hidden" type="image/webp" srcSet={srcSet} sizes={imageSizes} />
      <Image {...props} alt={props.alt} src={fallback} unoptimized loading={preload || priority ? "eager" : loading} />
    </picture>
  );
}

/** Local artwork uses committed variants; Sanity photos are resized by the CDN. */
export default function SiteImage({ src, unoptimized, ...props }: ImageProps) {
  if (typeof src === "string" && artwork[src]?.length && !unoptimized && !props.overrideSrc) {
    return <StaticImage {...props} src={src} />;
  }
  const responsive = typeof src === "string" && isSanityImage(src);
  return <Image {...props} alt={props.alt} src={src} unoptimized={!responsive || unoptimized} />;
}
