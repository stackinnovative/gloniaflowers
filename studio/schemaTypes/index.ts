import { collection } from "./collection";
import { product } from "./product";
import { siteSettings } from "./siteSettings";

export const schemaTypes = [product, collection, siteSettings];

/** Document types with exactly one document, opened directly from the menu. */
export const singletonTypes = new Set(["siteSettings"]);
