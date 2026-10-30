// Copy the current centrepiece onto the site's own CDN, avoiding another connection
// for mobile LCP. All other photos continue to use Sanity's responsive image loader.
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export function heroWidths(source) {
  const url = new URL(source);
  if (url.origin !== "https://cdn.sanity.io" || !url.pathname.startsWith("/images/")) return [];
  // Sanity asset names contain the original dimensions. A saved crop can be smaller.
  const originalWidth = Number(url.pathname.match(/-(\d+)x\d+\.[a-z]+$/i)?.[1]);
  const cropWidth = url.searchParams.has("rect") ? Number(url.searchParams.get("rect").split(",")[2]) : originalWidth;
  const maximum = Math.min(originalWidth, cropWidth, 1280);
  if (!Number.isSafeInteger(maximum) || maximum < 1 || url.searchParams.has("h") || url.searchParams.has("dpr") ||
      (url.searchParams.has("fit") && url.searchParams.get("fit") !== "max")) return [];
  return [...new Set([320, 480, 560, 640, 750, 960, 1280].map((width) => Math.min(width, maximum)))];
}

export async function prepareHero(root = process.cwd(), fetchImage = fetch) {
  const manifestPath = path.join(root, "data/hero-image.json");
  try {
    // A failed/partial refresh must not leave a previous hero selected.
    await writeFile(manifestPath, "null\n");
    const settings = JSON.parse(await readFile(path.join(root, "data/settings.json"), "utf8"));
    const products = JSON.parse(await readFile(path.join(root, "data/products.json"), "utf8"));
    const source = products.find((product) => product.slug === settings.featured?.hero?.[1])?.image;
    const widths = typeof source === "string" ? heroWidths(source) : [];
    if (!widths.length) return null;

    const directory = path.join(root, "public/images/hero");
    await mkdir(directory, { recursive: true });
    const downloads = await Promise.allSettled(widths.map(async (width) => {
      const url = new URL(source);
      url.searchParams.set("w", String(width));
      url.searchParams.set("fit", "max");
      url.searchParams.set("fm", "webp");
      url.searchParams.delete("auto");
      const response = await fetchImage(url, { redirect: "error", signal: AbortSignal.timeout(15000) });
      if (!response.ok || response.headers.get("content-type")?.split(";")[0] !== "image/webp") {
        throw new Error(`Image request failed (${response.status})`);
      }
      const bytes = Buffer.from(await response.arrayBuffer());
      if (bytes.length < 12 || bytes.length > 5_000_000 || bytes.toString("ascii", 0, 4) !== "RIFF" || bytes.toString("ascii", 8, 12) !== "WEBP") {
        throw new Error("Invalid WebP response");
      }
      const hash = createHash("sha256").update(bytes).digest("hex").slice(0, 20);
      const filename = `${hash}-${width}.webp`;
      await writeFile(path.join(directory, filename), bytes);
      return { width, src: `/images/hero/${filename}` };
    }));
    const failed = downloads.find((result) => result.status === "rejected");
    if (failed) throw failed.reason;
    const variants = downloads.map((result) => result.value);
    const manifest = { source, variants };
    // Only a complete set is eligible for the exported page.
    await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    console.log(`Hero: prepared ${variants.length} local variants with the CMS crop and quality.`);
    return manifest;
  } catch (error) {
    console.warn(`Hero: using the Sanity image fallback (${error.message}).`);
    return null;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await prepareHero();
