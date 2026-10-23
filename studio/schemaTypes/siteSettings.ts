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

const infoLines = (name: string, title: string, description: string) =>
  defineField({ name, title, description, type: "array", of: [defineArrayMember({ type: "string", validation: (rule) => rule.required().max(200) })] });

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  groups: [
    { name: "contact", title: "Contact", default: true },
    { name: "shop", title: "Hours & delivery" },
    { name: "addOns", title: "Add-ons" },
    { name: "productInfo", title: "Product page info" },
    { name: "featured", title: "Home page" },
    { name: "perfumes", title: "Perfumes" },
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
    defineField({
      name: "deliverySlots",
      title: "Delivery time slots",
      type: "array",
      group: "shop",
      description: "Choices in the Delivery time dropdown on the product page, in order (e.g. 9–10 AM). If a slot is removed, carts that used it keep the item and date without a time.",
      of: [defineArrayMember({ type: "string", validation: (rule) => rule.required().max(30) })],
      validation: (rule) => rule.required().min(1).unique(),
    }),
    defineField({
      name: "boxSizes",
      title: "Box sizes (inches)",
      type: "object",
      group: "shop",
      description: "Box diameter for each size, shown on the product page, catalogue cards and the size reference.",
      options: { columns: 4 },
      fields: (["S", "M", "L", "XL"] as const).map((key) =>
        defineField({ name: key, title: { S: "Small", M: "Medium", L: "Large", XL: "Extra large" }[key], type: "number", validation: (rule) => rule.required().positive() })),
      validation: (rule) =>
        rule.custom((sizes: { S?: number; M?: number; L?: number; XL?: number } | undefined) =>
          sizes?.S && sizes.M && sizes.L && sizes.XL && !(sizes.S < sizes.M && sizes.M < sizes.L && sizes.L < sizes.XL) ? "Each size must be bigger than the one before." : true),
    }),
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
              description: "Optional. List different kinds with their own price (e.g. each chocolate); customers pick one from a dropdown. Leave empty for a single tick box.",
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
      name: "productInfo",
      title: "Product page info",
      type: "object",
      group: "productInfo",
      description: "Lines in the Details, Care and Delivery tabs on every product page. One line per item.",
      fields: [
        infoLines("details", "Details tab", "Shown after the product's own description (and \"Available in Small, Medium and Large.\" for boxes)."),
        infoLines("careBox", "Care tab — flower boxes", "For products that come in S / M / L."),
        infoLines("careBouquet", "Care tab — bouquets & stems", "For products with a single price."),
        infoLines("delivery", "Delivery tab", "Shown after the shop hours line, which comes from Hours & delivery."),
      ],
    }),
    defineField({
      name: "showReviews",
      title: "Show Google reviews",
      type: "boolean",
      group: "featured",
      description: "Rating and the latest Google reviews on the home page, refreshed daily. Needs the Google Place ID.",
      initialValue: true,
    }),
    defineField({ name: "heroText", title: "Hero text", type: "text", rows: 3, group: "featured", description: "Line under the logo at the top of the home page.", validation: (rule) => rule.required().max(200) }),
    defineField({
      name: "ourWork",
      title: "Our work",
      type: "object",
      group: "featured",
      description: "The “Made for your big moments” section.",
      fields: [
        defineField({ name: "intro", title: "Intro line", type: "string", validation: (rule) => rule.max(160) }),
        defineField({
          name: "items",
          title: "Items",
          type: "array",
          description: "Up to four sit side by side on a computer; phones swipe through them. Without a photo, a placeholder shows.",
          of: [
            defineArrayMember({
              type: "object",
              name: "workItem",
              fields: [
                defineField({ name: "name", title: "Name", type: "string", validation: (rule) => rule.required().max(40) }),
                defineField({ name: "description", title: "Short line", type: "string", validation: (rule) => rule.max(80) }),
                defineField({ name: "image", title: "Photo", type: "image", options: { hotspot: true } }),
              ],
              preview: { select: { title: "name", subtitle: "description", media: "image" } },
            }),
          ],
          validation: (rule) => rule.max(8),
        }),
      ],
    }),
    productPicks("hero", "Hero photos", "Three arched photos at the top. The middle one is the large centrepiece and the only one shown on phones.", 3, 3),
    defineField({ name: "orderExample", title: "WhatsApp example product", type: "reference", to: [{ type: "product" }], group: "featured", description: "Shown in the How to order chat.", validation: (rule) => rule.required() }),
    defineField({ name: "sizeReference", title: "Size reference product", type: "reference", to: [{ type: "product" }], group: "featured", description: "Shown in the S / M / L circles. Pick a box.", validation: (rule) => rule.required() }),
    productPicks("customOrder", "Custom order card photos", "Three small round photos on the “Made just for you” card.", 3, 3),
    productPicks("gallery", "Gallery", "Photo strip near the bottom of the home page.", 3, 12),
    defineField({
      name: "perfumes",
      title: "Perfumes section",
      type: "object",
      group: "perfumes",
      description: "The home page perfume section. Turning it off also removes the Perfumes link from the menus.",
      fields: [
        defineField({ name: "show", title: "Show on the website", type: "boolean", initialValue: true }),
        defineField({ name: "badge", title: "Badge", type: "string", description: "Small pill at the top, e.g. Coming soon. Leave empty to hide.", validation: (rule) => rule.max(30) }),
        defineField({ name: "eyebrow", title: "Line above the heading", type: "string", description: "Leave empty to hide.", validation: (rule) => rule.max(60) }),
        defineField({ name: "title", title: "Heading word", type: "string", description: "Shown in script after “GLONIA”.", validation: (rule) => rule.required().max(20) }),
        defineField({ name: "text", title: "Text", type: "text", rows: 3, validation: (rule) => rule.required().max(240) }),
        defineField({ name: "image", title: "Photo", type: "image", description: "Shown in the round frame. Leave empty for the default pink bottle." }),
        defineField({ name: "imageLabel", title: "Label under the photo", type: "string", description: "e.g. Launching soon. Leave empty to hide.", validation: (rule) => rule.max(30) }),
        defineField({ name: "buttonLabel", title: "Button text", type: "string", validation: (rule) => rule.required().max(40) }),
        defineField({ name: "whatsappMessage", title: "WhatsApp message", type: "text", rows: 2, description: "Typed for the customer when they tap the button.", validation: (rule) => rule.required().max(300) }),
        defineField({ name: "note", title: "Note under the button", type: "string", description: "Leave empty to hide.", validation: (rule) => rule.max(80) }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Site settings" }) },
});
