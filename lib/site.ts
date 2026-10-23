// Single place for contact info and every client placeholder.
// Shop details, hours, add-ons and featured products are edited in Sanity Studio
// (Site settings) and synced into data/settings.json at build time.
//
// TODO client — still placeholders in Site settings (or data/settings.json):
// - Add-on names and prices (empty price is shown as "Price to confirm")
// - Collection photos for premium, custom, choco, bridal, car, gifts (Collections in the Studio)
// - Our work photos (Site settings → Home page)
// - Higher-resolution product photos (current ones are crops from the catalogue)
import settingsData from "@/data/settings.json";

export type AddOnOption = { id: string; name: string; price: number | null };
/** With `options` (e.g. different chocolates) customers pick those instead, and `price` is unused. */
export type AddOn = AddOnOption & { options?: AddOnOption[] };
/** One thing a customer can tick: a plain add-on, or one option of an add-on. */
export type AddOnChoice = AddOnOption & { group: string };

type Settings = {
  tagline: string;
  description: string;
  phoneDisplay: string;
  whatsappNumber: string;
  email: string;
  /** "HH:MM", 24-hour clock, shop time zone. */
  hours: { open: string; close: string };
  address: { street: string; city: string };
  /** Google Maps search for the footer map: shop name + address, or "lat,long". Empty hides the map. */
  mapQuery: string;
  /** The shop's Google Maps listing name, used as the directions destination. */
  googleListing: string;
  /** Google Place ID (ChIJ…) for the reviews section. */
  googlePlaceId: string;
  showReviews: boolean;
  instagram: { handle: string; url: string };
  addOns: AddOn[];
  /** Line under the logo in the home page hero. */
  heroText: string;
  /** Time slots offered on the product page, in order. */
  deliverySlots: string[];
  /** Box diameter in inches for each size. */
  boxSizes: { S: number; M: number; L: number; XL: number };
  ourWork: {
    intro: string;
    /** `image` is a Sanity CDN URL, or null to show a placeholder. */
    items: { name: string; description: string; image: string | null }[];
  };
  perfumes: {
    /** False hides the home page section and the Perfumes nav links. */
    show: boolean;
    badge: string;
    eyebrow: string;
    /** Script word after "GLONIA" in the heading. */
    title: string;
    text: string;
    /** Ribbon under the bottle. */
    imageLabel: string;
    /** Sanity CDN URL, or null for the default bottle in public/images. */
    image: string | null;
    buttonLabel: string;
    whatsappMessage: string;
    note: string;
  };
  /** Lines in the product page's Details / Care / Delivery tabs, shared by every product. */
  productInfo: {
    details: string[];
    /** Care tips for products with sizes (flower boxes). */
    careBox: string[];
    /** Care tips for products without sizes (bouquets, stems). */
    careBouquet: string[];
    delivery: string[];
  };
  featured: {
    /** Left, centrepiece, right. */
    hero: string[];
    orderExample: string;
    sizeReference: string;
    customOrder: string[];
    gallery: string[];
  };
};

const settings: Settings = settingsData;

/** "08:30" → "8:30 AM", "21:00" → "9 PM", "12:00" → "12 PM". */
function formatTime(time: string): string {
  const [hour, minute] = time.split(":").map(Number);
  const h = hour % 12 || 12;
  return `${h}${minute ? `:${String(minute).padStart(2, "0")}` : ""} ${hour < 12 ? "AM" : "PM"}`;
}

export const site = {
  name: "GLONIA Flowers & Perfumes",
  shortName: "GLONIA",
  tagline: settings.tagline,
  description: settings.description,
  url: "https://gloniaflowers.vercel.app", // TODO client: switch to https://gloniaflowers.in once that domain is connected; order links, sitemap and SEO use it

  phoneDisplay: settings.phoneDisplay,
  phoneTel: `+${settings.whatsappNumber}`,
  whatsappNumber: settings.whatsappNumber,
  email: settings.email,

  timeZone: "Asia/Kolkata",
  hours: {
    ...settings.hours,
    label: `${formatTime(settings.hours.open)} – ${formatTime(settings.hours.close)}`,
    opensAt: formatTime(settings.hours.open),
  },

  // Locality and region match the Google listing ("Malaparamba, Kozhikode, Keralam") for search.
  address: { ...settings.address, locality: "Kozhikode", region: "Kerala", country: "IN" },
  // TODO client: confirm delivery / service areas (used in search data and llms.txt).
  areaServed: [
    { type: "City", name: "Kozhikode" },
    { type: "State", name: "Kerala" },
  ],
  mapQuery: settings.mapQuery.trim(),
  googleListing: settings.googleListing.trim(),
  googlePlaceId: settings.googlePlaceId,
  showReviews: settings.showReviews,
  instagram: settings.instagram,
  heroText: settings.heroText,
  boxSizes: settings.boxSizes,
  ourWork: settings.ourWork,
  perfumes: settings.perfumes,
  productInfo: settings.productInfo,
  featured: settings.featured,
} as const;

export const addOns: AddOn[] = settings.addOns;

// Option ids are only unique within their add-on, so they are prefixed with it ("choc/ferrero").
export const addOnChoices: AddOnChoice[] = addOns.flatMap(({ options, ...addOn }) => options?.length
  ? options.map((option) => ({ ...option, id: `${addOn.id}/${option.id}`, group: addOn.id }))
  : [{ ...addOn, group: addOn.id }]);

export const deliverySlots: readonly string[] = settings.deliverySlots;
/** One of `deliverySlots`; saved carts are checked against the current list. */
export type DeliverySlot = string;
