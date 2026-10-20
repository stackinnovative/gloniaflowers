import collectionsData from "@/data/collections.json";
import productsData from "@/data/products.json";
import { site } from "./site";
import { formatPrice } from "./whatsapp";

export type SizeKey = "S" | "M" | "L";
export type Sizes = Record<SizeKey, number>;

/** image: tile photo, or null until the client supplies one. */
export type Collection = { id: string; name: string; order: number; image: string | null };

export type Product = {
  slug: string;
  name: string;
  collection: string;
  alsoIn: string[];
  price: number;
  sizes: Sizes | null;
  image: string;
  description: string;
};

export const SIZE_KEYS: SizeKey[] = ["S", "M", "L"];
export const SIZE_NAMES: Record<SizeKey, string> = { S: "Small", M: "Medium", L: "Large" };
/** '5.5"' etc., from Site settings → Hours & delivery → Box sizes. */
export const SIZE_INCHES: Record<SizeKey, string> = {
  S: `${site.boxSizes.S}"`,
  M: `${site.boxSizes.M}"`,
  L: `${site.boxSizes.L}"`,
};

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
