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

// Products and collections come in the order the client drags them to in the Studio (orderRank).
const published = '!(_id in path("drafts.**"))';
// An image with the editor's crop and focus point (hotspot), plus the original size to turn the crop into pixels.
const photo = '{ crop, hotspot, "url": asset->url, "dimensions": asset->metadata.dimensions }';
const query = `{
  "collections": *[_type == "collection" && ${published} && defined(id.current)] | order(orderRank asc, name asc) {
    "id": id.current, name, "image": image${photo}
  },
  "products": *[_type == "product" && ${published} && defined(slug.current)] | order(orderRank asc, name asc) {
    "slug": slug.current, name,
    "collection": collection->id.current,
    "alsoIn": alsoIn[]->id.current,
    hasSizes, price, sizes { S, M, L, XL },
    "image": image${photo},
    description
  },
  "settings": *[_id == "siteSettings"][0] {
    tagline, description, phoneDisplay, whatsappNumber, email,
    hours { open, close }, address { street, city }, mapQuery, googleListing, googlePlaceId, showReviews, instagram { handle, url },
    productInfo { details, careBox, careBouquet, delivery },
    heroText, deliverySlots, sameDayLeadHours, boxSizes { S, M, L, XL },
    ourWork { intro, items[] { name, description, "image": image${photo} } },
    perfumes { show, badge, eyebrow, title, text, imageLabel, "image": image${photo}, buttonLabel, whatsappMessage, note },
    "addOns": addOns[] { "id": id.current, name, "price": coalesce(price, null), "options": options[] { "id": id.current, name, "price": coalesce(price, null) } },
    "featured": {
      "hero": hero[]->slug.current,
      "orderExample": orderExample->slug.current,
      "sizeReference": sizeReference->slug.current,
      "customOrder": customOrder[]->slug.current,
      "gallery": gallery[]->slug.current
    }
  }
}`;

// Always the live API: the CDN (apicdn) can serve a stale copy for a while after a publish,
// and a webhook-triggered build would then deploy old content. One request per build.
const url = `https://${projectId}.api.sanity.io/v2025-02-19/data/query/${dataset}?query=${encodeURIComponent(query)}&perspective=published`;
const response = await fetch(url, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined);
if (!response.ok) throw new Error(`Sanity: query failed (${response.status}) ${await response.text()}`);
const { result } = await response.json();

const problems = [];
const isPrice = (value) => Number.isSafeInteger(value) && value > 0;
const SIZE_KEYS = ["S", "M", "L", "XL"];
const isId = (value) => typeof value === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
const isText = (value) => typeof value === "string" && value.trim() !== "";
const clamp = (value) => Math.min(1, Math.max(0, value));

/**
 * CDN URL for a Sanity image with the editor's crop applied, and its focus point as a CSS
 * object-position ("50% 30%") for frames that trim the photo. No focus when it's the centre.
 */
function cdnPhoto(image) {
  if (typeof image?.url !== "string") return null;
  const { width, height } = image.dimensions ?? {};
  const crop = image.crop;
  let box = { left: 0, top: 0, width: 1, height: 1 };
  let rect = "";
  if (crop && width && height && (crop.left || crop.right || crop.top || crop.bottom)) {
    const left = clamp(crop.left), top = clamp(crop.top);
    box = { left, top, width: clamp(1 - left - clamp(crop.right)), height: clamp(1 - top - clamp(crop.bottom)) };
    rect = `rect=${[box.left * width, box.top * height, box.width * width, box.height * height].map(Math.round).join(",")}&`;
  }
  const url = `${image.url}?${rect}w=1200&fit=max&auto=format`;
  const spot = image.hotspot;
  if (!spot || !box.width || !box.height) return { url };
  // The hotspot is relative to the whole image; make it relative to the cropped part.
  const x = Math.round(clamp((spot.x - box.left) / box.width) * 100);
  const y = Math.round(clamp((spot.y - box.top) / box.height) * 100);
  return x === 50 && y === 50 ? { url } : { url, focus: `${x}% ${y}%` };
}

/** { image, imageFocus? } for an optional photo: image is null when there is none. */
function photoFields(image) {
  const result = cdnPhoto(image);
  return { image: result?.url ?? null, ...(result?.focus ? { imageFocus: result.focus } : {}) };
}

const collections = result.collections.map((c, index) => ({ id: c.id, name: c.name, order: index + 1, ...photoFields(c.image) }));
const collectionIds = new Set();
for (const c of collections) {
  if (!isId(c.id) || typeof c.name !== "string" || !c.name) problems.push(`collection "${c.name ?? c.id}": missing name or invalid link id`);
  if (collectionIds.has(c.id)) problems.push(`collection "${c.id}": link id used twice`);
  collectionIds.add(c.id);
}

const slugs = new Set();
const products = result.products.map((p) => {
  const label = `product "${p.name ?? p.slug}"`;
  // Every size is optional; a box offers the sizes that have a price.
  const sizes = p.hasSizes ? Object.fromEntries(SIZE_KEYS.filter((key) => p.sizes?.[key] != null).map((key) => [key, p.sizes[key]])) : null;
  const sizePrices = sizes ? Object.values(sizes) : [];
  if (!isId(p.slug)) problems.push(`${label}: invalid link "${p.slug}"`);
  if (slugs.has(p.slug)) problems.push(`${label}: link "${p.slug}" used twice`);
  slugs.add(p.slug);
  if (typeof p.name !== "string" || !p.name) problems.push(`${label}: missing name`);
  if (!collectionIds.has(p.collection)) problems.push(`${label}: main collection is missing or unpublished`);
  if (sizes ? !(sizePrices.length && sizePrices.every(isPrice)) : !isPrice(p.price)) problems.push(`${label}: missing or invalid price`);
  if (sizePrices.some((price, index) => index > 0 && price < sizePrices[index - 1])) problems.push(`${label}: size prices should go up from smaller to bigger sizes`);
  if (typeof p.image?.url !== "string") problems.push(`${label}: missing photo`);
  if (typeof p.description !== "string" || !p.description) problems.push(`${label}: missing description`);
  return {
    slug: p.slug,
    name: p.name,
    collection: p.collection,
    alsoIn: [...new Set((p.alsoIn ?? []).filter((id) => collectionIds.has(id) && id !== p.collection))],
    price: sizes ? Math.min(...sizePrices) : p.price,
    sizes,
    ...photoFields(p.image),
    description: p.description,
  };
});

if (!products.length) problems.push("no published products");

// Settings fields never filled in Sanity (added after launch) keep the committed values.
const committed = JSON.parse(await readFile(path.resolve("data", "settings.json"), "utf8"));

// Missing settings document (e.g. before the seed): keep the committed settings.json.
const settings = result.settings && readSettings(result.settings);

function readSettings(raw) {
  const label = "Site settings";
  for (const key of ["tagline", "description", "phoneDisplay", "email"]) {
    if (!isText(raw[key])) problems.push(`${label}: missing ${key}`);
  }
  if (!/^[1-9]\d{9,14}$/.test(raw.whatsappNumber ?? "")) problems.push(`${label}: WhatsApp number must be digits with country code`);
  const { open, close } = raw.hours ?? {};
  // "HH:MM" strings compare correctly as text.
  const isTime = (value) => typeof value === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
  if (!(isTime(open) && isTime(close) && open < close)) problems.push(`${label}: opening hours must be HH:MM, closing after opening`);
  if (!isText(raw.address?.street) || !isText(raw.address?.city)) problems.push(`${label}: missing address`);
  const mapQuery = typeof raw.mapQuery === "string" ? raw.mapQuery.trim() : "";
  const googlePlaceId = typeof raw.googlePlaceId === "string" ? raw.googlePlaceId.trim() : "";
  if (googlePlaceId && !/^[A-Za-z0-9_-]{10,}$/.test(googlePlaceId)) problems.push(`${label}: Google Place ID looks wrong (it starts with ChIJ)`);
  if (/^https?:/i.test(mapQuery)) problems.push(`${label}: Map location must be an address or coordinates, not a link`);
  if (!isText(raw.instagram?.handle) || !/^https:\/\//.test(raw.instagram?.url ?? "")) problems.push(`${label}: missing Instagram handle or link`);
  const readAddOn = (a, where) => {
    if (!isId(a.id) || !isText(a.name)) problems.push(`${label}: ${where} "${a.name ?? a.id}" needs a name and id`);
    if (a.price != null && !(Number.isSafeInteger(a.price) && a.price >= 0)) problems.push(`${label}: ${where} "${a.name}" has an invalid price`);
    return { id: a.id, name: a.name, price: a.price ?? null };
  };
  const uniqueIds = (items, message) => {
    if (new Set(items.map((item) => item.id)).size !== items.length) problems.push(`${label}: ${message}`);
  };
  // Choices (e.g. different chocolates) are only written when the add-on has some.
  const addOns = (raw.addOns ?? []).map((a) => {
    const addOn = readAddOn(a, "add-on");
    const options = (a.options ?? []).map((o) => readAddOn(o, `${a.name} choice`));
    uniqueIds(options, `two choices of "${a.name}" share an id`);
    return options.length ? { ...addOn, options } : addOn;
  });
  uniqueIds(addOns, "two add-ons share an id");
  const infoLines = (key) => {
    const lines = raw.productInfo?.[key];
    if (lines == null) return committed.productInfo[key];
    if (!Array.isArray(lines) || !lines.every(isText)) problems.push(`${label}: Product page info → ${key} has an empty line`);
    return Array.isArray(lines) ? lines.map((line) => (typeof line === "string" ? line.trim() : line)) : [];
  };
  const productInfo = {
    details: infoLines("details"),
    careBox: infoLines("careBox"),
    careBouquet: infoLines("careBouquet"),
    delivery: infoLines("delivery"),
  };

  const text = (value) => (typeof value === "string" ? value.trim() : "");
  const heroText = raw.heroText == null ? committed.heroText : text(raw.heroText);
  if (!heroText) problems.push(`${label}: missing hero text`);

  const deliverySlots = raw.deliverySlots == null ? committed.deliverySlots : raw.deliverySlots.map(text);
  if (!deliverySlots.length || !deliverySlots.every(Boolean)) problems.push(`${label}: delivery time slots need at least one slot and no empty lines`);
  if (new Set(deliverySlots).size !== deliverySlots.length) problems.push(`${label}: a delivery time slot is listed twice`);
  // Same pattern as slotStart() in lib/delivery.ts, which reads each slot's start time for same-day orders.
  const unreadable = deliverySlots.filter((slot) => !/^\d{1,2}(:\d{2})?\s*(AM|PM)?\s*[–-]\s*\d{1,2}(:\d{2})?\s*(AM|PM)$/i.test(slot));
  if (unreadable.length) problems.push(`${label}: write delivery time slots like "9–10 AM" or "11 AM–12 PM" (check: ${unreadable.join(", ")})`);
  const sameDayLeadHours = raw.sameDayLeadHours ?? committed.sameDayLeadHours;
  if (!(Number.isInteger(sameDayLeadHours) && sameDayLeadHours >= 0 && sameDayLeadHours <= 12)) problems.push(`${label}: same-day preparation time must be 0–12 hours`);

  const boxSizes = raw.boxSizes == null ? committed.boxSizes : { S: raw.boxSizes.S, M: raw.boxSizes.M, L: raw.boxSizes.L, XL: raw.boxSizes.XL ?? committed.boxSizes.XL };
  const isSize = (value) => typeof value === "number" && value > 0;
  if (!(isSize(boxSizes.S) && isSize(boxSizes.M) && isSize(boxSizes.L) && isSize(boxSizes.XL) && boxSizes.S < boxSizes.M && boxSizes.M < boxSizes.L && boxSizes.L < boxSizes.XL)) {
    problems.push(`${label}: box sizes must be numbers, Small < Medium < Large < Extra large`);
  }

  const ourWork = raw.ourWork == null ? committed.ourWork : {
    intro: text(raw.ourWork.intro),
    items: (raw.ourWork.items ?? []).map((item) => ({
      name: text(item.name),
      description: text(item.description),
      ...photoFields(item.image),
    })),
  };
  if (!ourWork.items.every((item) => item.name)) problems.push(`${label}: every Our work item needs a name`);
  if (new Set(ourWork.items.map((item) => item.name)).size !== ourWork.items.length) problems.push(`${label}: two Our work items share a name`);

  const p = raw.perfumes;
  const perfumes = p == null ? committed.perfumes : {
    show: p.show !== false,
    badge: text(p.badge),
    eyebrow: text(p.eyebrow),
    title: text(p.title),
    text: text(p.text),
    imageLabel: text(p.imageLabel),
    image: cdnPhoto(p.image)?.url ?? null,
    buttonLabel: text(p.buttonLabel),
    whatsappMessage: text(p.whatsappMessage),
    note: text(p.note),
  };
  for (const key of ["title", "text", "buttonLabel", "whatsappMessage"]) {
    if (perfumes.show && !perfumes[key]) problems.push(`${label}: Perfumes section is shown but missing ${key}`);
  }

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
    googlePlaceId,
    showReviews: raw.showReviews !== false,
    instagram: { handle: raw.instagram?.handle, url: raw.instagram?.url },
    addOns,
    heroText,
    deliverySlots,
    sameDayLeadHours,
    boxSizes,
    ourWork,
    perfumes,
    productInfo,
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
