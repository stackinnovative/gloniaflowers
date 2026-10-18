// Fetch the shop's Google rating and reviews (Places API) into data/reviews.json before each build.
// Never fails the build: without a key, place ID or a good response, the reviews section is hidden.
// data/reviews.json is gitignored: Google's terms don't allow keeping review content, so every
// build fetches it fresh (a scheduled daily rebuild keeps it current).
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

try {
  process.loadEnvFile(".env.local");
} catch {
  // No local env file — use the environment (e.g. Vercel project settings).
}

const target = path.resolve("data", "reviews.json");
const empty = { placeId: null, rating: null, count: 0, url: null, reviews: [] };

async function save(data) {
  await writeFile(target, `${JSON.stringify(data, null, 2)}\n`);
}

async function exists() {
  return readFile(target).then(() => true, () => false);
}

// `npm run dev` only needs the file to exist; it doesn't refetch on every start.
if (process.argv.includes("--if-missing") && (await exists())) process.exit(0);

const settings = JSON.parse(await readFile(path.resolve("data", "settings.json"), "utf8"));
const key = process.env.GOOGLE_PLACES_API_KEY;
const placeId = settings.googlePlaceId;

if (!settings.showReviews || !placeId || !key) {
  const reason = !settings.showReviews ? "turned off in Site settings" : !placeId ? "no Google Place ID in Site settings" : "GOOGLE_PLACES_API_KEY not set";
  console.log(`Reviews: ${reason} — section hidden.`);
  await save(empty);
  process.exit(0);
}

try {
  const response = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=en`, {
    headers: { "X-Goog-Api-Key": key, "X-Goog-FieldMask": "rating,userRatingCount,googleMapsUri,reviews" },
    signal: AbortSignal.timeout(15_000),
  });
  const place = await response.json();
  if (!response.ok) throw new Error(`${response.status} ${place.error?.status ?? ""} ${place.error?.message ?? ""}`.trim());

  const reviews = (place.reviews ?? [])
    .filter((r) => typeof r.text?.text === "string" && r.text.text.trim() && Number.isInteger(r.rating))
    .map((r) => ({
      author: r.authorAttribution?.displayName ?? "Google user",
      authorUrl: r.authorAttribution?.uri ?? null,
      photo: r.authorAttribution?.photoUri ?? null,
      rating: r.rating,
      text: r.text.text.trim(),
      time: r.relativePublishTimeDescription ?? "",
      url: r.googleMapsUri ?? null,
    }));

  if (typeof place.rating !== "number" || !reviews.length) throw new Error("no rating or reviews in the response");

  await save({ placeId, rating: place.rating, count: place.userRatingCount ?? reviews.length, url: place.googleMapsUri ?? null, reviews });
  console.log(`Reviews: ${place.rating}★ from ${place.userRatingCount} — ${reviews.length} shown.`);
} catch (error) {
  console.warn(`Reviews: couldn't fetch from Google (${error.message}) — section hidden this build.`);
  await save(empty);
}
