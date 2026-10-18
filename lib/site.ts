// Single place for contact info and every client placeholder.
// Shop details, hours, add-ons and featured products are edited in Sanity Studio
// (Site settings) and synced into data/settings.json at build time.
//
// TODO client — still placeholders in Site settings (or data/settings.json):
// - Same-day delivery cut-off time
// - Add-on names and prices (empty price is shown as "Price to confirm")
// - Collection photos for premium, custom, choco, bridal, car, gifts (Collections in the Studio)
// - Higher-resolution product photos (current ones are crops from the catalogue)
import settingsData from "@/data/settings.json";

export type AddOn = { id: string; name: string; price: number | null };

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
  sameDayCutoff: string;
  instagram: { handle: string; url: string };
  addOns: AddOn[];
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
  url: "https://gloniaflowers.vercel.app", // TODO client: switch to the custom domain when there is one

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
  sameDayCutoff: settings.sameDayCutoff,
  instagram: settings.instagram,
  featured: settings.featured,
} as const;

export const addOns: AddOn[] = settings.addOns;

export const deliverySlots = ["9 AM–12 PM", "12–3 PM", "3–6 PM", "6–9 PM"] as const;
export type DeliverySlot = (typeof deliverySlots)[number];

// Shown in the Our work cards until the collection has a photo.
export const workPhotoPlaceholders: Record<string, string> = {
  bridal: "[Bridal photo]",
  car: "[Car décor photo]",
  custom: "[Custom bouquet photo]",
};
