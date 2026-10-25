import { orderableDocumentListDeskItem } from "@sanity/orderable-document-list";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes, singletonTypes } from "./schemaTypes";
import { dataset, projectId } from "./env";
import { publishAllTool } from "./tools/publishAll";

export default defineConfig({
  name: "glonia",
  title: "GLONIA Flowers & Perfumes",
  projectId,
  dataset,
  plugins: [
    structureTool({
      // Products and collections are sorted by dragging; the site shows them in that order.
      structure: (S, context) =>
        S.list()
          .title("Shop")
          .items([
            orderableDocumentListDeskItem({ type: "product", title: "Products", S, context }),
            orderableDocumentListDeskItem({ type: "collection", title: "Collections", S, context }),
            S.divider(),
            S.listItem()
              .title("Site settings")
              .id("siteSettings")
              .child(S.document().schemaType("siteSettings").documentId("siteSettings")),
          ]),
    }),
  ],
  // Extra tab next to Structure for publishing many drafts at once.
  tools: (prev) => [...prev, publishAllTool()],
  schema: {
    types: schemaTypes,
    // Site settings can't be created from "+ New".
    templates: (templates) => templates.filter(({ schemaType }) => !singletonTypes.has(schemaType)),
  },
  document: {
    // ...and can't be duplicated or deleted.
    actions: (actions, { schemaType }) =>
      singletonTypes.has(schemaType)
        ? actions.filter(({ action }) => action && ["publish", "discardChanges", "restore"].includes(action))
        : actions,
  },
});
