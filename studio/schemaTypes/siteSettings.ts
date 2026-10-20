import { defineArrayMember, defineField, defineType } from "sanity";

const productRef = defineArrayMember({ type: "reference", to: [{ type: "product" }] });

const productPicks = (name: string, title: string, description: string, min: number, max: number) =>
  defineField({
    name,
    title,
    description,
    type: "array",
    of: [productRef],
    group: "featured",
    validation: (rule) => rule.required().unique().min(min).max(max),
  });

const priceLabel = (price: unknown) => (typeof price !== "number" ? "Price to confirm" : price === 0 ? "No charge" : `₹${price}`);

const uniqueIds = (message: string) => (items: { id?: { current?: string } }[] | undefined) => {
  const ids = (items ?? []).map((item) => item.id?.current);
  return new Set(ids).size === ids.length ? true : message;
};

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  groups: [
    { name: "contact", title: "Contact", default: true },
    { name: "shop", title: "Hours & delivery" },
    { name: "addOns", title: "Add-ons" },
    { name: "featured", title: "Home page" },
  ],
  fields: [
    defineField({ name: "tagline", title: "Tagline", type: "string", group: "contact", validation: (rule) => rule.required().max(60) }),
    defineField({
      name: "description",
      title: "Shop description",
      type: "text",
      rows: 3,
      group: "contact",
      description: "Used by Google and when links are shared.",
      validation: (rule) => rule.required().max(200),
    }),
    defineField({
      name: "whatsappNumber",
      title: "WhatsApp number",
      type: "string",
      group: "contact",
      description: "Digits only with country code, e.g. 916238823455. All orders go here — double-check it.",
      validation: (rule) => rule.required().regex(/^[1-9]\d{9,14}$/, { name: "digits with country code" }),
    }),
    defineField({ name: "phoneDisplay", title: "Phone (as shown)", type: "string", group: "contact", description: "e.g. +91 62388 23455", validation: (rule) => rule.required() }),
    defineField({ name: "email", title: "Email", type: "string", group: "contact", validation: (rule) => rule.required().email() }),
    defineField({
      name: "address",
      title: "Address",
      type: "object",
      group: "contact",
      fields: [
        defineField({ name: "street", title: "Street", type: "string", validation: (rule) => rule.required() }),
        defineField({ name: "city", title: "City and PIN", type: "string", validation: (rule) => rule.required() }),
      ],
    }),
    defineField({
      name: "mapQuery",
      title: "Map location",
      type: "string",
      group: "contact",
      description:
        "Shown as a map in the footer and used for “Get directions”. Type the shop name and full address as you would search it on Google Maps (e.g. “GLONIA Flowers, MG Road, Kochi 682016”), or coordinates like 9.9667,76.2420. Leave empty to hide the map.",
      validation: (rule) =>
        rule.max(200).custom((value: string | undefined) =>
          value && /^https?:/i.test(value.trim()) ? "Paste the address or coordinates, not a link." : true),
    }),
    defineField({
      name: "googleListing",
      title: "Google Maps listing name",
      type: "string",
      group: "contact",
      description: "The shop's name and area exactly as on Google Maps, e.g. “Glonia flowers and perfumes, Malaparamba, Kozhikode”. Get directions opens this listing. Leave empty to use the Map location.",
      validation: (rule) => rule.max(120),
    }),
    defineField({
      name: "googlePlaceId",
      title: "Google Place ID",
      type: "string",
      group: "contact",
      description: "Identifies the Google listing for the reviews section (starts with ChIJ). Find it at developers.google.com/maps/documentation/places/web-service/place-id.",
      validation: (rule) => rule.regex(/^[A-Za-z0-9_-]{10,}$/, { name: "Place ID" }),
    }),
    defineField({
      name: "instagram",
      title: "Instagram",
      type: "object",
      group: "contact",
      fields: [
        defineField({ name: "handle", title: "Handle", type: "string", description: "e.g. @glonia.flowers", validation: (rule) => rule.required() }),
        defineField({ name: "url", title: "Profile link", type: "url", validation: (rule) => rule.required().uri({ scheme: ["https"] }) }),
      ],
    }),
    defineField({
      name: "hours",
      title: "Opening hours (India time)",
      type: "object",
      group: "shop",
      description: "24-hour clock, e.g. 08:30 and 19:30 for 8:30 AM – 7:30 PM. Keep in step with Google Maps. Drives the Open now / Closed now strip. Delivery time slots (one hour each, 9 AM – 8 PM) are set in code.",
      options: { columns: 2 },
      fields: [
        defineField({ name: "open", title: "Opens", type: "string", validation: (rule) => rule.required().regex(/^([01]\d|2[0-3]):[0-5]\d$/, { name: "HH:MM" }) }),
        defineField({ name: "close", title: "Closes", type: "string", validation: (rule) => rule.required().regex(/^([01]\d|2[0-3]):[0-5]\d$/, { name: "HH:MM" }) }),
      ],
      validation: (rule) =>
        rule.custom((hours: { open?: string; close?: string } | undefined) =>
          hours?.open && hours.close && hours.open >= hours.close ? "Closing time must be after opening time." : true),
    }),
    defineField({ name: "sameDayCutoff", title: "Same-day delivery cut-off", type: "string", group: "shop", description: "e.g. 2 PM", validation: (rule) => rule.required() }),
    defineField({
      name: "addOns",
      title: "Add-ons",
      type: "array",
      group: "addOns",
      description: "Extras on the product page. Leave the price empty to show “Price to confirm”; 0 shows no price.",
      of: [
        defineArrayMember({
          type: "object",
          name: "addOn",
          fields: [
            defineField({ name: "name", title: "Name", type: "string", validation: (rule) => rule.required().max(40) }),
            defineField({
              name: "id",
              title: "Id",
              type: "slug",
              description: "Internal; don't change after launch.",
              options: { source: (_doc, { parent }) => (parent as { name?: string }).name ?? "", maxLength: 30 },
              validation: (rule) => rule.required(),
            }),
            defineField({ name: "price", title: "Price (₹)", type: "number", description: "Not used when choices are listed below.", validation: (rule) => rule.integer().min(0) }),
            defineField({
              name: "options",
              title: "Choices",
              type: "array",
              description: "Optional. List different kinds with their own price (e.g. each chocolate or gift); customers pick one from a dropdown. Leave empty for a single tick box.",
              of: [
                defineArrayMember({
                  type: "object",
                  name: "addOnOption",
                  fields: [
                    defineField({ name: "name", title: "Name", type: "string", validation: (rule) => rule.required().max(40) }),
                    defineField({
                      name: "id",
                      title: "Id",
                      type: "slug",
                      description: "Internal; don't change after launch.",
                      options: { source: (_doc, { parent }) => (parent as { name?: string }).name ?? "", maxLength: 30 },
                      validation: (rule) => rule.required(),
                    }),
                    defineField({ name: "price", title: "Price (₹)", type: "number", description: "Leave empty for “Price to confirm”.", validation: (rule) => rule.integer().min(0) }),
                  ],
                  preview: { select: { title: "name", price: "price" }, prepare: ({ title, price }) => ({ title, subtitle: priceLabel(price) }) },
                }),
              ],
              validation: (rule) => rule.custom(uniqueIds("Each choice needs its own id.")),
            }),
          ],
          preview: {
            select: { title: "name", price: "price", options: "options" },
            prepare: ({ title, price, options }) => ({
              title,
              subtitle: Array.isArray(options) && options.length ? `${options.length} choices` : priceLabel(price),
            }),
          },
        }),
      ],
      validation: (rule) => rule.custom(uniqueIds("Each add-on needs its own id.")),
    }),
    defineField({
      name: "showReviews",
      title: "Show Google reviews",
      type: "boolean",
      group: "featured",
      description: "Rating and the latest Google reviews on the home page, refreshed daily. Needs the Google Place ID.",
      initialValue: true,
    }),
    productPicks("hero", "Hero photos", "Three arched photos at the top. The middle one is the large centrepiece and the only one shown on phones.", 3, 3),
    defineField({ name: "orderExample", title: "WhatsApp example product", type: "reference", to: [{ type: "product" }], group: "featured", description: "Shown in the How to order chat.", validation: (rule) => rule.required() }),
    defineField({ name: "sizeReference", title: "Size reference product", type: "reference", to: [{ type: "product" }], group: "featured", description: "Shown in the S / M / L circles. Pick a box.", validation: (rule) => rule.required() }),
    productPicks("customOrder", "Custom order card photos", "Three small round photos on the “Made just for you” card.", 3, 3),
    productPicks("gallery", "Gallery", "Photo strip near the bottom of the home page.", 3, 12),
  ],
  preview: { prepare: () => ({ title: "Site settings" }) },
});
