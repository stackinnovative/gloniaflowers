import { getCollections, getProductsIn } from "@/lib/products";
import { FavouritePicksSlider } from "./FavouritePicksSlider";

export function FavouritePicks() {
  const collections = getCollections().map((collection) => ({
    ...collection,
    products: getProductsIn(collection.id).slice(0, 4),
  }));

  return collections.length ? <FavouritePicksSlider collections={collections} /> : null;
}
