// Run manually with `node scripts/optimize-static-images.mjs` after changing an
// original asset. Generated files and the manifest are committed with the site;
// production builds do not need an image encoder or a network request for these.
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = fileURLToPath(new URL("../", import.meta.url));
const outputDirectory = path.join(root, "public/images/optimized");
const manifestPath = path.join(root, "data/static-images.json");
const assets = [
  {
    src: "/images/logo.webp",
    original: "logo.png",
    name: "logo",
    widths: [80, 160, 256, 416, 480],
  },
  {
    src: "/images/logo-mark.webp",
    original: "logo-mark.png",
    name: "logo-mark",
    widths: [48, 96, 144],
  },
  {
    src: "/images/floral-corner-tl.jpg",
    original: "floral-corner-tl.jpg",
    name: "floral-corner-tl",
    widths: [160, 240, 320, 480],
  },
  {
    src: "/images/floral-corner-br.jpg",
    original: "floral-corner-br.jpg",
    name: "floral-corner-br",
    widths: [160, 240, 320, 480],
  },
];

async function main() {
  await mkdir(outputDirectory, { recursive: true });
  await mkdir(path.dirname(manifestPath), { recursive: true });
  const manifest = {};

  for (const asset of assets) {
    const original = await readFile(path.join(root, "public/images", asset.original));
    const metadata = await sharp(original).metadata();
    if (!metadata.width || !metadata.height) {
      throw new Error(`Missing source dimensions: ${asset.original}`);
    }

    // Include the native size for larger screens, and never upscale or crop.
    const widths = [...new Set([...asset.widths, metadata.width])]
      .filter((width) => width <= metadata.width)
      .sort((a, b) => a - b);
    const candidates = [];

    for (const width of widths) {
      const { data, info } = await sharp(original)
        .resize({ width, withoutEnlargement: true, kernel: "lanczos3" })
        // Keep the resized logo's alpha channel lossless. Quality 80 was chosen
        // after comparing 75/80/85 versions against the existing artwork.
        .webp({ quality: 80, alphaQuality: 100, effort: 6 })
        .toBuffer({ resolveWithObject: true });
      candidates.push({ data, info });
    }

    // Resampling a transparent logo can make its alpha channel more complex:
    // the native 515px logo is sharper AND smaller than the 416/480px versions.
    // Omit any candidate when a larger one uses no more bytes, so srcset never
    // selects that unnecessarily heavy file. Keep truthful width descriptors.
    const efficient = candidates.filter(({ data }, index) =>
      !candidates.slice(index + 1).some((larger) => larger.data.length <= data.length)
    );
    const variants = [];
    for (const { data, info } of efficient) {
      const hash = createHash("sha256").update(data).digest("hex").slice(0, 12);
      const filename = `${asset.name}-${info.width}-${hash}.webp`;
      await writeFile(path.join(outputDirectory, filename), data);
      variants.push({
        width: info.width,
        height: info.height,
        src: `/images/optimized/${filename}`,
      });
      console.log(`${asset.name}: ${info.width}x${info.height}, ${data.length} bytes`);
    }

    manifest[asset.src] = variants;
  }

  // Publish the manifest only after every referenced file has been written.
  // Originals and older hashed variants are retained for existing deployments.
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
