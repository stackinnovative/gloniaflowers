import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes, singletonTypes } from "./schemaTypes";
import { dataset, projectId } from "./env";

export default defineConfig({
  name: "glonia",
  title: "GLONIA Flowers & Perfumes",
  projectId,
  dataset,
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Shop")
          .items([
            S.documentTypeListItem("product").title("Products"),
            S.documentTypeListItem("collection").title("Collections"),
            S.divider(),
            S.listItem()
              .title("Site settings")
              .id("siteSettings")
              .child(S.document().schemaType("siteSettings").documentId("siteSettings")),
          ]),
    }),
  ],
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
