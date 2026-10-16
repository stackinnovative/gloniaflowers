// Single place for contact info and every client placeholder.
// Shop details, hours, add-ons and featured products are edited in Sanity Studio
// (Site settings) and synced into data/settings.json at build time.
//
// TODO client — still placeholders in Site settings (or data/settings.json):
// - Shop address and city
// - Same-day delivery cut-off time
// - Instagram handle and link
// - Add-on names and prices (empty price is shown as "Price to confirm")
// - Confirm shop hours (9 AM – 9 PM is assumed)
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
  /** Whole hours, 24-hour clock, shop time zone. */
  hours: { open: number; close: number };
  address: { street: string; city: string };
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

/** 9 → "9 AM", 21 → "9 PM", 12 → "12 PM". */
function formatHour(hour: number): string {
  const h = hour % 12 || 12;
  return `${h} ${hour % 24 < 12 ? "AM" : "PM"}`;
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
    label: `${formatHour(settings.hours.open)} – ${formatHour(settings.hours.close)}`,
    opensAt: formatHour(settings.hours.open),
  },

  address: { ...settings.address, country: "IN" },
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
