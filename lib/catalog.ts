import { getProducts, isInCollection } from "./products";

export const priceFilters = [
  { id: "any", name: "Any price", min: 0, max: Infinity },
  { id: "u1", name: "Under ₹1,000", min: 0, max: 999 },
  { id: "mid", name: "₹2,000–₹3,000", min: 2000, max: 3000 },
  { id: "top", name: "₹4,000+", min: 4000, max: Infinity },
] as const;

export type PriceFilter = (typeof priceFilters)[number]["id"];
export type CatalogSort = "featured" | "low" | "high";

// Featured order follows the approved catalogue; product details stay in data/.
const featuredSlugs = [
  "peach-white-blooming-box", "blush-rose-blooming-box", "red-rose-classic-box",
  "single-red-rose", "pastel-garden-blooming-box", "white-hydrangea-box",
  "white-rose-mini", "yellow-white-rose-box", "sunshine-yellow-rose",
  "white-garden-gold-box", "pink-rose-classic-box", "twin-white-roses",
];

export function catalogProducts(collection: string, price: PriceFilter, sort: CatalogSort) {
  const filter = priceFilters.find((item) => item.id === price) ?? priceFilters[0];
  const products = getProducts().filter((product) =>
    (collection === "all" || isInCollection(product, collection)) &&
    product.price >= filter.min && product.price <= filter.max,
  );
  return products.sort((a, b) => {
    if (sort === "low") return a.price - b.price;
    if (sort === "high") return b.price - a.price;
    const aIndex = featuredSlugs.indexOf(a.slug);
    const bIndex = featuredSlugs.indexOf(b.slug);
    return (aIndex < 0 ? Infinity : aIndex) - (bIndex < 0 ? Infinity : bIndex);
  });
}
