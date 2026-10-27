import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";
import { defineField, defineType } from "sanity";

type Sizes = { S?: number; M?: number; L?: number; XL?: number };
type ProductDoc = { hasSizes?: boolean; sizes?: Sizes; collection?: { _ref: string } };

// Same defaults as lib/products.ts.
const DEFAULT_FRESH_NOTE = "Fresh flowers daily";
const DEFAULT_DELIVERY_NOTE = "Same-day delivery";

const rupees = (name: "S" | "M" | "L" | "XL", title: string, description: string) =>
  defineField({ name, title, description, type: "number", validation: (rule) => rule.integer().positive() });

export const product = defineType({
  name: "product",
  title: "Product",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (rule) => rule.required().max(60) }),
    defineField({
      name: "slug",
      title: "Link",
      type: "slug",
      description: "Used in the product link, e.g. /product/blush-rose-blooming-box.",
      options: { source: "name", maxLength: 60 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "collection",
      title: "Main collection",
      type: "reference",
      to: [{ type: "collection" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "alsoIn",
      title: "Also show in",
      type: "array",
      of: [{ type: "reference", to: [{ type: "collection" }] }],
      validation: (rule) =>
        rule.unique().custom((refs, context) => {
          const main = (context.document as ProductDoc | undefined)?.collection?._ref;
          const list = (refs ?? []) as { _ref: string }[];
          return list.some((ref) => ref._ref === main) ? "The main collection is already included." : true;
        }),
    }),
    defineField({
      name: "hasSizes",
      title: "Comes in sizes",
      type: "boolean",
      description: "Turn on for boxes sold in sizes (Small 5.5″, Medium 6.5″, Large 7.5″, Extra large 9″). Fill in only the sizes this box comes in.",
      initialValue: false,
    }),
    defineField({
      name: "price",
      title: "Price (₹)",
      type: "number",
      hidden: ({ document }) => Boolean((document as ProductDoc | undefined)?.hasSizes),
      validation: (rule) =>
        rule.custom((value, context) => {
          if ((context.document as ProductDoc | undefined)?.hasSizes) return true;
          if (typeof value !== "number") return "Enter a price.";
          return Number.isInteger(value) && value > 0 ? true : "Use a whole number above 0.";
        }),
    }),
    defineField({
      name: "sizes",
      title: "Size prices (₹)",
      type: "object",
      hidden: ({ document }) => !(document as ProductDoc | undefined)?.hasSizes,
      options: { columns: 4 },
      fields: [
        rupees("S", "Small", "5.5″ — leave empty if not offered"),
        rupees("M", "Medium", "6.5″ — leave empty if not offered"),
        rupees("L", "Large", "7.5″ — leave empty if not offered"),
        rupees("XL", "Extra large", "9″ — leave empty if not offered"),
      ],
      validation: (rule) =>
        rule.custom((sizes: Sizes | undefined, context) => {
          if (!(context.document as ProductDoc | undefined)?.hasSizes) return true;
          const prices = (["S", "M", "L", "XL"] as const).flatMap((key) => (sizes?.[key] === undefined ? [] : [sizes[key]]));
          if (!prices.length) return "Enter a price for at least one size.";
          return prices.every((price, index) => index === 0 || price >= prices[index - 1]) ? true : "Prices should go up from smaller to bigger sizes.";
        }),
    }),
    defineField({
      name: "image",
      title: "Photo",
      type: "image",
      description: "Portrait or square, at least 1200px wide. Use the crop button to trim the photo and drag the circle onto the flowers — the site keeps that spot in view in every frame. The product name is used as the alt text.",
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Short description",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required().max(300),
    }),
    defineField({
      name: "freshNote",
      title: "Under the photo — flowers",
      type: "string",
      description: `Next to the flower icon on the product page. Leave empty for “${DEFAULT_FRESH_NOTE}”.`,
      placeholder: DEFAULT_FRESH_NOTE,
      validation: (rule) => rule.max(40),
    }),
    defineField({
      name: "deliveryNote",
      title: "Under the photo — delivery",
      type: "string",
      description: `Next to the van icon on the product page. Leave empty for “${DEFAULT_DELIVERY_NOTE}”.`,
      placeholder: DEFAULT_DELIVERY_NOTE,
      validation: (rule) => rule.max(40),
    }),
    // Hidden position from dragging in the Products list (the catalogue’s “Featured” sort).
    orderRankField({ type: "product" }),
  ],
  orderings: [orderRankOrdering],
  preview: {
    select: { title: "name", subtitle: "collection.name", media: "image" },
  },
});
