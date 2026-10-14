import Image from "next/image";
import Link from "next/link";
import { getProducts, priceLabel, type Product } from "@/lib/products";
import "./RelatedProducts.css";

export function RelatedProducts({ product }: { product: Product }) {
  const related = getProducts()
    .filter((candidate) => candidate.collection === product.collection && candidate.slug !== product.slug)
    .slice(0, 4);
  if (!related.length) return null;

  return (
    <section aria-labelledby="related-products-heading" className="gl-related-products">
      <div className="gl-related-products-heading">
        <p>More to love</p>
        <h2 id="related-products-heading">You may also <span>like</span></h2>
      </div>
      <ul role="list" aria-label="Related products" className="gl-related-products-list">
        {related.map((item) => (
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
          </li>
        ))}
      </ul>
    </section>
  );
}
