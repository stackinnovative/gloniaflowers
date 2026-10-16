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

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  groups: [
    { name: "contact", title: "Contact", default: true },
    { name: "shop", title: "Hours & delivery" },
    { name: "addOns", title: "Add-ons" },
    { name: "featured", title: "Home page photos" },
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
      description: "Whole hours on a 24-hour clock, e.g. 9 and 21 for 9 AM – 9 PM. Drives the Open now / Closed now strip. Delivery time slots stay 9 AM – 9 PM.",
      options: { columns: 2 },
      fields: [
        defineField({ name: "open", title: "Opens", type: "number", validation: (rule) => rule.required().integer().min(0).max(23) }),
        defineField({ name: "close", title: "Closes", type: "number", validation: (rule) => rule.required().integer().min(1).max(24) }),
      ],
      validation: (rule) =>
        rule.custom((hours: { open?: number; close?: number } | undefined) =>
          hours?.open !== undefined && hours.close !== undefined && hours.open >= hours.close ? "Closing time must be after opening time." : true),
    }),
    defineField({ name: "sameDayCutoff", title: "Same-day delivery cut-off", type: "string", group: "shop", description: "e.g. 2 PM", validation: (rule) => rule.required() }),
    defineField({
      name: "addOns",
      title: "Add-ons",
      type: "array",
      group: "addOns",
      description: "Extras on the product page. Leave the price empty to show “Price to confirm”; 0 shows “Free”.",
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
            defineField({ name: "price", title: "Price (₹)", type: "number", validation: (rule) => rule.integer().min(0) }),
          ],
          preview: { select: { title: "name", price: "price" }, prepare: ({ title, price }) => ({ title, subtitle: price === undefined ? "Price to confirm" : price === 0 ? "Free" : `₹${price}` }) },
        }),
      ],
      validation: (rule) =>
        rule.custom((items: { id?: { current?: string } }[] | undefined) => {
          const ids = (items ?? []).map((item) => item.id?.current);
          return new Set(ids).size === ids.length ? true : "Each add-on needs its own id.";
        }),
    }),
    productPicks("hero", "Hero photos", "Three arched photos at the top. The middle one is the large centrepiece and the only one shown on phones.", 3, 3),
    defineField({ name: "orderExample", title: "WhatsApp example product", type: "reference", to: [{ type: "product" }], group: "featured", description: "Shown in the How to order chat.", validation: (rule) => rule.required() }),
    defineField({ name: "sizeReference", title: "Size reference product", type: "reference", to: [{ type: "product" }], group: "featured", description: "Shown in the S / M / L circles. Pick a box.", validation: (rule) => rule.required() }),
    productPicks("customOrder", "Custom order card photos", "Three small round photos on the “Made just for you” card.", 3, 3),
    productPicks("gallery", "Gallery", "Photo strip near the bottom of the home page.", 3, 12),
  ],
  preview: { prepare: () => ({ title: "Site settings" }) },
});
