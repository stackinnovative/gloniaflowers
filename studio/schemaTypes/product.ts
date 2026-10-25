import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";
import { defineField, defineType } from "sanity";

type Sizes = { S?: number; M?: number; L?: number; XL?: number };
type ProductDoc = { hasSizes?: boolean; sizes?: Sizes; collection?: { _ref: string } };

const rupees = (name: string, title: string, description: string, required = true) =>
  defineField({
    name,
    title,
    description,
    type: "number",
    validation: (rule) => (required ? rule.required() : rule).integer().positive(),
  });

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
      title: "Comes in S / M / L / XL",
      type: "boolean",
      description: "Turn on for boxes sold in Small 5.5″, Medium 6.5″, Large 7.5″ and Extra large 9″.",
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
        rupees("S", "Small", "5.5″ — shown as the “from” price"),
        rupees("M", "Medium", "6.5″"),
        rupees("L", "Large", "7.5″"),
        rupees("XL", "Extra large", "9″ — optional; leave empty if this box isn’t made in XL", false),
      ],
      validation: (rule) =>
        rule.custom((sizes: Sizes | undefined, context) => {
          if (!(context.document as ProductDoc | undefined)?.hasSizes) return true;
          if (!sizes?.S || !sizes.M || !sizes.L) return "Enter all three size prices.";
          return sizes.S <= sizes.M && sizes.M <= sizes.L && (sizes.XL === undefined || sizes.L <= sizes.XL) ? true : "Prices should go up from Small to Extra large.";
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
    // Hidden position from dragging in the Products list (the catalogue’s “Featured” sort).
    orderRankField({ type: "product" }),
  ],
  orderings: [orderRankOrdering],
  preview: {
    select: { title: "name", subtitle: "collection.name", media: "image" },
  },
});
