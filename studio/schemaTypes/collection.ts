import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";
import { defineField, defineType } from "sanity";

export const collection = defineType({
  name: "collection",
  title: "Collection",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      description: "Shown on the site, e.g. “Korean Bouquets”.",
      validation: (rule) => rule.required().max(40),
    }),
    defineField({
      name: "id",
      title: "Link id",
      type: "slug",
      description: "Used in links like /catalog?c=korean. Don’t change it after launch — old links stop working.",
      options: { source: "name", maxLength: 30 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "image",
      title: "Tile photo",
      type: "image",
      description: "Shown on the home page tiles, the catalogue bubbles and the Our work cards. Use the crop button to trim it and set the focus point. Leave empty to show a leaf icon or placeholder.",
      options: { hotspot: true },
    }),
    // Hidden position from dragging in the Collections list (menus and the Favourite picks slider).
    orderRankField({ type: "collection" }),
  ],
  orderings: [orderRankOrdering],
  preview: { select: { title: "name", subtitle: "id.current" } },
});
