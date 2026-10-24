import collectionsData from "@/data/collections.json";
import productsData from "@/data/products.json";
import { site } from "./site";
import { formatPrice } from "./whatsapp";

export type SizeKey = "S" | "M" | "L" | "XL";
/** XL is optional: a box offers it only once it has an XL price. */
export type Sizes = { S: number; M: number; L: number; XL?: number };

/** image: tile photo, or null until the client supplies one. imageFocus: see Product. */
export type Collection = { id: string; name: string; order: number; image: string | null; imageFocus?: string };

export type Product = {
  slug: string;
  name: string;
  collection: string;
  alsoIn: string[];
  price: number;
  sizes: Sizes | null;
  image: string;
  /** The editor's focus point as a CSS object-position ("50% 30%"), kept in view when a frame trims the photo. */
  imageFocus?: string;
  description: string;
};

export const SIZE_KEYS: SizeKey[] = ["S", "M", "L", "XL"];
export const SIZE_NAMES: Record<SizeKey, string> = { S: "Small", M: "Medium", L: "Large", XL: "Extra Large" };
/** '5.5"' etc., from Site settings → Hours & delivery → Box sizes. */
export const SIZE_INCHES: Record<SizeKey, string> = {
  S: `${site.boxSizes.S}"`,
  M: `${site.boxSizes.M}"`,
  L: `${site.boxSizes.L}"`,
  XL: `${site.boxSizes.XL}"`,
};

/** The sizes a product is sold in, smallest first. */
export function sizeKeys(sizes: Sizes): SizeKey[] {
  return SIZE_KEYS.filter((key) => sizes[key] !== undefined);
}

/** Price of a size; one the product doesn't offer falls back to Small. */
export function sizePrice(sizes: Sizes, size: SizeKey): number {
  return sizes[size] ?? sizes.S;
}

/** "Small, Medium and Large" */
export function sizeNamesList(keys: SizeKey[]): string {
  const names = keys.map((key) => SIZE_NAMES[key]);
  return names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}` : names.join("");
}

const products: Product[] = productsData;
const collections: Collection[] = [...collectionsData].sort((a, b) => a.order - b.order);

export function getProducts(): Product[] {
  return products;
}

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

/** Collections in display order. */
export function getCollections(): Collection[] {
  return collections;
}

export function getCollection(id: string): Collection | undefined {
  return collections.find((c) => c.id === id);
}

export function isInCollection(product: Product, id: string): boolean {
  return product.collection === id || product.alsoIn.includes(id);
}

export function getProductsIn(id: string): Product[] {
  return products.filter((p) => isInCollection(p, id));
}

/** "from ₹2,000" for sized products, "₹200" otherwise. */
export function priceLabel(product: Product): string {
  return product.sizes ? `from ${formatPrice(product.price)}` : formatPrice(product.price);
}
