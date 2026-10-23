import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { getProducts, priceLabel, type Product } from "@/lib/products";
import "./RelatedProducts.css";

type ProductRowProps = {
  headingId: string;
  accent: string;
  title: ReactNode;
  label: string;
  products: Product[];
  more?: { href: string; label: string };
  /** For use inside a page column: smaller heading, and a swipe row with fixed-width cards on every screen. */
  compact?: boolean;
  /** Extra control under each card, e.g. an add-to-cart button. */
  action?: (product: Product) => ReactNode;
};

/** Swipe row on mobile, grid on desktop (unless `compact`). Used for related products and cart suggestions. */
export function ProductRow({ headingId, accent, title, label, products, more, compact = false, action }: ProductRowProps) {
  if (!products.length) return null;

  return (
    <section aria-labelledby={headingId} className={`gl-related-products${compact ? " gl-related-products-compact" : ""}`}>
      <div className="gl-related-products-heading">
        <p>{accent}</p>
        <h2 id={headingId}>{title}</h2>
        {more && <Link href={more.href} prefetch={false} className="gl-related-products-more">{more.label}</Link>}
      </div>
      <ul role="list" aria-label={label} className="gl-related-products-list">
        {products.map((item) => (
          <li key={item.slug} data-product-slug={item.slug}>
            <Link href={`/product/${item.slug}`} prefetch={false} className="gl-related-products-card">
              <div className="gl-related-products-frame">
                <div className="gl-related-products-photo">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="(min-width: 1320px) 387px, (min-width: 861px) 31vw, 168px"
                    className="gl-related-products-image"
                  />
                </div>
              </div>
              <h3>{item.name}</h3>
              <p className="gl-related-products-price">{priceLabel(item)}</p>
            </Link>
            {action?.(item)}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function RelatedProducts({ product }: { product: Product }) {
  const related = getProducts()
    .filter((candidate) => candidate.collection === product.collection && candidate.slug !== product.slug)
    .slice(0, 4);

  return (
    <ProductRow
      headingId="related-products-heading"
      accent="More to love"
      title={<>You may also <span>like</span></>}
      label="Related products"
      products={related}
    />
  );
}
