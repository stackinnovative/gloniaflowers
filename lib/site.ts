// Single place for contact info and every client placeholder.
// Search for "TODO client" before launch.

export const site = {
  name: "GLONIA Flowers & Perfumes",
  shortName: "GLONIA",
  tagline: "Flowers that say it for you",
  description:
    "Korean bouquets, flower boxes and bridal décor — hand-made in our studio and delivered fresh to your door. Order on WhatsApp.",
  url: "https://glonia.example", // TODO client: live domain

  phoneDisplay: "+91 62388 23455",
  phoneTel: "+916238823455",
  whatsappNumber: "916238823455",
  email: "Gloniadesigns@gmail.com",

  timeZone: "Asia/Kolkata",
  // TODO client: confirm shop hours (9 AM – 9 PM is assumed)
  hours: { open: 9, close: 21, label: "9 AM – 9 PM", opensAt: "9 AM" },

  address: {
    street: "[Shop address]", // TODO client
    city: "[City, PIN]", // TODO client
    country: "IN",
  },
  sameDayCutoff: "[cut-off time]", // TODO client: same-day delivery cut-off

  instagram: {
    handle: "[@instagram handle]", // TODO client
    url: "https://instagram.com/", // TODO client
  },
} as const;

export type AddOn = { id: string; name: string; price: number | null };

// TODO client: add-on names and prices (null is shown as "Price to confirm")
export const addOns: AddOn[] = [
  { id: "card", name: "Message card", price: 0 },
  { id: "choc", name: "Chocolates", price: null },
  { id: "gift", name: "Gift add-on", price: null },
];

export const deliverySlots = ["9 AM–12 PM", "12–3 PM", "3–6 PM", "6–9 PM"] as const;
export type DeliverySlot = (typeof deliverySlots)[number];

// Thumbnail per collection. null = no photo yet.
// TODO client: photos for premium, custom, choco, bridal, car, gifts
export const collectionImages: Record<string, string | null> = {
  korean: "/images/products/sunshine-yellow-rose.jpg",
  premium: null,
  custom: null,
  choco: null,
  red: "/images/products/single-red-rose.jpg",
  classic: "/images/products/red-rose-classic-box.jpg",
  bloom: "/images/products/pastel-garden-blooming-box.jpg",
  bridal: null,
  car: null,
  gifts: null,
};

// TODO client: replace these work photo placeholders with the collection images above.
export const workPhotoPlaceholders: Record<string, string> = {
  bridal: "[Bridal photo]",
  car: "[Car décor photo]",
  custom: "[Custom bouquet photo]",
};

// TODO client: higher-resolution product photos (current ones are crops from the catalogue)
