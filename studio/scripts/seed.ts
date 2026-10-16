// One-off import of the launch content (data/*.json + public/images) into Sanity.
// Run from studio/: npm run seed   (safe to re-run: documents use fixed ids)
import { createReadStream } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { getCliClient } from "sanity/cli";

type SeedCollection = { id: string; name: string; order: number; image: string | null };
type SeedProduct = {
  slug: string;
  name: string;
  collection: string;
  alsoIn: string[];
  price: number;
  sizes: { S: number; M: number; L: number } | null;
  image: string;
  description: string;
};
type SeedSettings = {
  tagline: string;
  description: string;
  phoneDisplay: string;
  whatsappNumber: string;
  email: string;
  hours: { open: number; close: number };
  address: { street: string; city: string };
  sameDayCutoff: string;
  instagram: { handle: string; url: string };
  addOns: { id: string; name: string; price: number | null }[];
  featured: { hero: string[]; orderExample: string; sizeReference: string; customOrder: string[]; gallery: string[] };
};

const root = path.resolve(process.cwd(), "..");
const client = getCliClient({ apiVersion: "2025-02-19" });

async function readJson<T>(file: string): Promise<T> {
  return JSON.parse(await readFile(path.join(root, "data", file), "utf8")) as T;
}

// Sanity de-duplicates identical files, but skip re-uploading within one run.
const uploaded = new Map<string, string>();
async function imageField(publicPath: string) {
  if (!publicPath.startsWith("/")) throw new Error(`Not a local image: ${publicPath}`);
  let id = uploaded.get(publicPath);
  if (!id) {
    const file = path.join(root, "public", publicPath);
    id = (await client.assets.upload("image", createReadStream(file), { filename: path.basename(file) }))._id;
    uploaded.set(publicPath, id);
    console.log(`Uploaded ${path.basename(file)}`);
  }
  return { _type: "image", asset: { _type: "reference", _ref: id } };
}

const ref = (prefix: string, id: string) => ({ _type: "reference", _ref: `${prefix}-${id}` });
const refList = (prefix: string, ids: string[]) => ids.map((id) => ({ ...ref(prefix, id), _key: id }));

const collections = await readJson<SeedCollection[]>("collections.json");
const products = await readJson<SeedProduct[]>("products.json");
const settings = await readJson<SeedSettings>("settings.json");
const tx = client.transaction();

for (const collection of collections) {
  tx.createOrReplace({
    _id: `collection-${collection.id}`,
    _type: "collection",
    name: collection.name,
    id: { _type: "slug", current: collection.id },
    order: collection.order,
    ...(collection.image ? { image: await imageField(collection.image) } : {}),
  });
}

for (const [index, product] of products.entries()) {
  const pricing: { sizes?: SeedProduct["sizes"]; price?: number } = product.sizes ? { sizes: product.sizes } : { price: product.price };
  tx.createOrReplace({
    _id: `product-${product.slug}`,
    _type: "product",
    name: product.name,
    slug: { _type: "slug", current: product.slug },
    collection: ref("collection", product.collection),
    alsoIn: refList("collection", product.alsoIn),
    hasSizes: product.sizes !== null,
    ...pricing,
    image: await imageField(product.image),
    description: product.description,
    order: (index + 1) * 10,
  });
}

const { featured, addOns, ...details } = settings;
tx.createOrReplace({
  _id: "siteSettings",
  _type: "siteSettings",
  ...details,
  addOns: addOns.map(({ id, name, price }) => ({
    _key: id,
    _type: "addOn",
    id: { _type: "slug", current: id },
    name,
    ...(price === null ? {} : { price }),
  })),
  hero: refList("product", featured.hero),
  orderExample: ref("product", featured.orderExample),
  sizeReference: ref("product", featured.sizeReference),
  customOrder: refList("product", featured.customOrder),
  gallery: refList("product", featured.gallery),
});

await tx.commit();
console.log(`Imported ${collections.length} collections, ${products.length} products and site settings.`);
