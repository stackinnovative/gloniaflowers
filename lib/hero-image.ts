// Server/build-only: never import this module from a Client Component.
import { readFileSync, statSync } from "node:fs";
import path from "node:path";

type Variant = { width: number; src: string };

/** Ignore stale or incomplete generated images, retaining the current Sanity photo. */
export function getHeroImage(source: string, root = process.cwd()): { src: string; srcSet: string } | null {
  try {
    const manifest = JSON.parse(readFileSync(path.join(root, "data/hero-image.json"), "utf8"));
    if (manifest?.source !== source || !Array.isArray(manifest.variants) || !manifest.variants.length) return null;
    const variants: Variant[] = manifest.variants;
    let previousWidth = 0;
    for (const variant of variants) {
      if (!Number.isSafeInteger(variant.width) || variant.width <= previousWidth || variant.width > 1280 ||
          typeof variant.src !== "string" || !/^\/images\/hero\/[a-f0-9]{20}-\d+\.webp$/.test(variant.src) ||
          !variant.src.endsWith(`-${variant.width}.webp`)) return null;
      const file = statSync(path.join(root, "public", variant.src));
      if (!file.isFile() || !file.size) return null;
      previousWidth = variant.width;
    }
    return { src: variants[variants.length - 1].src, srcSet: variants.map(({ src, width }) => `${src} ${width}w`).join(", ") };
  } catch {
    return null;
  }
}
