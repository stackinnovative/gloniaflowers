// Pull published products, collections and site settings from Sanity into data/*.json before each build.
// Without SANITY_PROJECT_ID the committed JSON is used as is, so the site still builds offline.
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

try {
  process.loadEnvFile(".env.local");
} catch {
  // No local env file — use the environment (e.g. Vercel project settings).
}

const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET || "production";
const token = process.env.SANITY_API_TOKEN;

if (!projectId) {
  console.log("Sanity: SANITY_PROJECT_ID not set — building from the committed data/*.json.");
  process.exit(0);
}

const published = '!(_id in path("drafts.**"))';
const query = `{
  "collections": *[_type == "collection" && ${published} && defined(id.current)] | order(order asc) {
    "id": id.current, name, order, "image": image.asset->url
  },
  "products": *[_type == "product" && ${published} && defined(slug.current)] | order(order asc, name asc) {
    "slug": slug.current, name,
    "collection": collection->id.current,
    "alsoIn": alsoIn[]->id.current,
    hasSizes, price, sizes { S, M, L },
    "image": image.asset->url,
    description
  },
  "settings": *[_id == "siteSettings"][0] {
    tagline, description, phoneDisplay, whatsappNumber, email,
    hours { open, close }, address { street, city }, mapQuery, googleListing, sameDayCutoff, instagram { handle, url },
    "addOns": addOns[] { "id": id.current, name, "price": coalesce(price, null) },
    "featured": {
      "hero": hero[]->slug.current,
      "orderExample": orderExample->slug.current,
      "sizeReference": sizeReference->slug.current,
      "customOrder": customOrder[]->slug.current,
      "gallery": gallery[]->slug.current
    }
  }
}`;

// The CDN host is cached; a token (private dataset) needs the live API host.
const host = token ? "api.sanity.io" : "apicdn.sanity.io";
const url = `https://${projectId}.${host}/v2025-02-19/data/query/${dataset}?query=${encodeURIComponent(query)}&perspective=published`;
const response = await fetch(url, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined);
if (!response.ok) throw new Error(`Sanity: query failed (${response.status}) ${await response.text()}`);
const { result } = await response.json();

const problems = [];
const isPrice = (value) => Number.isSafeInteger(value) && value > 0;
const isId = (value) => typeof value === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
const isText = (value) => typeof value === "string" && value.trim() !== "";
const cdnImage = (url) => `${url}?w=1200&fit=max&auto=format`;

const collections = result.collections.map((c, index) => ({ id: c.id, name: c.name, order: c.order ?? index + 1, image: c.image ? cdnImage(c.image) : null }));
const collectionIds = new Set();
for (const c of collections) {
  if (!isId(c.id) || typeof c.name !== "string" || !c.name) problems.push(`collection "${c.name ?? c.id}": missing name or invalid link id`);
  if (collectionIds.has(c.id)) problems.push(`collection "${c.id}": link id used twice`);
  collectionIds.add(c.id);
}

const slugs = new Set();
const products = result.products.map((p) => {
  const label = `product "${p.name ?? p.slug}"`;
  const sizes = p.hasSizes ? p.sizes : null;
  if (!isId(p.slug)) problems.push(`${label}: invalid link "${p.slug}"`);
  if (slugs.has(p.slug)) problems.push(`${label}: link "${p.slug}" used twice`);
  slugs.add(p.slug);
  if (typeof p.name !== "string" || !p.name) problems.push(`${label}: missing name`);
  if (!collectionIds.has(p.collection)) problems.push(`${label}: main collection is missing or unpublished`);
  if (sizes ? !(isPrice(sizes.S) && isPrice(sizes.M) && isPrice(sizes.L)) : !isPrice(p.price)) problems.push(`${label}: missing or invalid price`);
  if (typeof p.image !== "string") problems.push(`${label}: missing photo`);
  if (typeof p.description !== "string" || !p.description) problems.push(`${label}: missing description`);
  return {
    slug: p.slug,
    name: p.name,
    collection: p.collection,
    alsoIn: [...new Set((p.alsoIn ?? []).filter((id) => collectionIds.has(id) && id !== p.collection))],
    price: sizes ? sizes.S : p.price,
    sizes: sizes ? { S: sizes.S, M: sizes.M, L: sizes.L } : null,
    image: typeof p.image === "string" ? cdnImage(p.image) : p.image,
    description: p.description,
  };
});

if (!products.length) problems.push("no published products");

// Missing settings document (e.g. before the seed): keep the committed settings.json.
const settings = result.settings && readSettings(result.settings);

function readSettings(raw) {
  const label = "Site settings";
  for (const key of ["tagline", "description", "phoneDisplay", "email", "sameDayCutoff"]) {
    if (!isText(raw[key])) problems.push(`${label}: missing ${key}`);
  }
  if (!/^[1-9]\d{9,14}$/.test(raw.whatsappNumber ?? "")) problems.push(`${label}: WhatsApp number must be digits with country code`);
  const { open, close } = raw.hours ?? {};
  // "HH:MM" strings compare correctly as text.
  const isTime = (value) => typeof value === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
  if (!(isTime(open) && isTime(close) && open < close)) problems.push(`${label}: opening hours must be HH:MM, closing after opening`);
  if (!isText(raw.address?.street) || !isText(raw.address?.city)) problems.push(`${label}: missing address`);
  const mapQuery = typeof raw.mapQuery === "string" ? raw.mapQuery.trim() : "";
  if (/^https?:/i.test(mapQuery)) problems.push(`${label}: Map location must be an address or coordinates, not a link`);
  if (!isText(raw.instagram?.handle) || !/^https:\/\//.test(raw.instagram?.url ?? "")) problems.push(`${label}: missing Instagram handle or link`);
  const addOns = (raw.addOns ?? []).map((a) => ({ id: a.id, name: a.name, price: a.price ?? null }));
  for (const a of addOns) {
    if (!isId(a.id) || !isText(a.name)) problems.push(`${label}: add-on "${a.name ?? a.id}" needs a name and id`);
    if (a.price !== null && !(Number.isSafeInteger(a.price) && a.price >= 0)) problems.push(`${label}: add-on "${a.name}" has an invalid price`);
  }
  if (new Set(addOns.map((a) => a.id)).size !== addOns.length) problems.push(`${label}: two add-ons share an id`);

  // Featured products must be published; unpublished picks are dropped with a warning.
  const known = (slug, where) => {
    if (slugs.has(slug)) return true;
    console.warn(`Sanity: ${label} → ${where} points to a product that isn't published; skipping it.`);
    return false;
  };
  const list = (key) => (raw.featured?.[key] ?? []).filter((slug) => known(slug, key));
  const single = (key) => {
    const slug = raw.featured?.[key];
    if (!known(slug, key)) problems.push(`${label}: pick a published product for ${key}`);
    return slug;
  };
  return {
    tagline: raw.tagline,
    description: raw.description,
    phoneDisplay: raw.phoneDisplay,
    whatsappNumber: raw.whatsappNumber,
    email: raw.email,
    hours: { open, close },
    address: { street: raw.address?.street, city: raw.address?.city },
    mapQuery,
    googleListing: typeof raw.googleListing === "string" ? raw.googleListing.trim() : "",
    sameDayCutoff: raw.sameDayCutoff,
    instagram: { handle: raw.instagram?.handle, url: raw.instagram?.url },
    addOns,
    featured: {
      hero: list("hero"),
      orderExample: single("orderExample"),
      sizeReference: single("sizeReference"),
      customOrder: list("customOrder"),
      gallery: list("gallery"),
    },
  };
}
if (problems.length) {
  // Fail the build rather than ship a broken catalogue; the live site keeps the last good deploy.
  throw new Error(`Sanity: fix these in the Studio, then publish again:\n- ${problems.join("\n- ")}`);
}

// One record per line keeps git diffs readable.
const toJson = (rows) => `[\n${rows.map((row) => `  ${JSON.stringify(row)}`).join(",\n")}\n]\n`;

async function save(file, next) {
  const target = path.resolve("data", file);
  // Git on Windows may check files out with CRLF.
  const current = (await readFile(target, "utf8").catch(() => "")).replace(/\r\n/g, "\n");
  if (current === next) return false;
  await writeFile(target, next);
  return true;
}

const changed = [
  await save("collections.json", toJson(collections)),
  await save("products.json", toJson(products)),
  settings ? await save("settings.json", `${JSON.stringify(settings, null, 2)}\n`) : false,
];
if (!settings) console.warn("Sanity: no published Site settings yet — keeping data/settings.json.");
console.log(`Sanity: ${collections.length} collections, ${products.length} products${changed.some(Boolean) ? " — data updated" : " — no changes"}.`);
