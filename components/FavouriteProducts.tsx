import Image from "next/image";
import { productPrices, type Collection, type Product } from "@/lib/products";
import { formatPrice, waLink } from "@/lib/whatsapp";
import { WhatsAppIcon } from "./Icons";
import { ShopLink } from "./ShopPause";
import "./FavouriteProducts.css";

type FavouriteProductsProps = {
  collection: Collection;
  products: Product[];
};

function productPrice(product: Product): string {
  const prices = productPrices(product);
  const minimum = Math.min(...prices);
  const maximum = Math.max(...prices);
  return minimum === maximum ? formatPrice(minimum) : `${formatPrice(minimum)} – ${formatPrice(maximum)}`;
}

export function FavouriteProducts({ collection, products }: FavouriteProductsProps) {
  if (products.length === 0) {
    return (
      <div className="gl-picks-empty" data-empty-collection={collection.id}>
        <p className="gl-picks-empty-accent">Coming soon</p>
        <h3 className="gl-picks-empty-title">{collection.name}</h3>
        <p className="gl-picks-empty-copy">
          <span className="gl-picks-empty-copy-mobile">New designs are being added. Message us for options and prices.</span>
          <span className="gl-picks-empty-copy-desktop">New designs are being added. Message us and we&apos;ll share options and prices today.</span>
        </p>
        <a
          href={waLink(`Hi GLONIA, I'm interested in ${collection.name}. Please share available designs and prices.`)}
          target="_blank"
          rel="noopener noreferrer"
          className="gl-picks-empty-link"
        >
          <WhatsAppIcon size={15} stroke="#E6CF93" />
          Ask on WhatsApp
        </a>
      </div>
    );
  }

  return (
    <ul className="gl-picks-products" role="list" aria-label={`${collection.name} products`}>
      {products.map((product) => (
        <li key={product.slug} className="gl-picks-products-item" data-product-slug={product.slug}>
          <ShopLink href={`/product/${product.slug}`} whatsapp={`Hi GLONIA, I'm interested in ${product.name}.`} className="gl-picks-card">
            <div className="gl-picks-card-frame">
              <div className="gl-picks-card-photo">
                <Image
                  src={product.image}
                  style={{ objectPosition: product.imageFocus }}
                  alt={product.name}
                  fill
                  sizes="(min-width: 1320px) 279px, (min-width: 861px) calc((100vw - 206px) / 4), 216px"
                  className="gl-picks-card-image"
                />
                <span className="gl-picks-card-badge">{collection.name.toUpperCase()}</span>
              </div>
            </div>
            <h3 className="gl-picks-card-title">{product.name}</h3>
            <p className="gl-picks-card-price">{productPrice(product)}</p>
          </ShopLink>
        </li>
      ))}
    </ul>
  );
}
