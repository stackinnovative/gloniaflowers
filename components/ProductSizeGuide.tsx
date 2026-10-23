import Image from "next/image";
import { SIZE_INCHES, SIZE_NAMES, sizeKeys, type Product } from "@/lib/products";
import { site } from "@/lib/site";
import "./ProductSizeGuide.css";

export function ProductSizeGuide({ product }: { product: Product }) {
  if (!product.sizes) return null;
  const keys = sizeKeys(product.sizes);

  return (
    <section id="sizes" aria-labelledby="product-size-guide-heading" className="gl-product-size-guide">
      <div className="gl-product-size-guide-content">
        <div aria-hidden="true" className="gl-product-size-guide-outline" />
        <div className="gl-product-size-guide-heading">
          <h2 id="product-size-guide-heading">Size guide</h2>
          <p className="gl-product-size-guide-title">Bigger box, <span>more blooms</span></p>
          <p className="gl-product-size-guide-copy">Same design and colours in every size.</p>
        </div>
        {/* Column widths follow the box diameters. */}
        <ul
          role="list"
          aria-label="Box sizes in inches"
          className="gl-product-size-guide-options"
          style={{ gridTemplateColumns: keys.map((size) => `${site.boxSizes[size]}fr`).join(" ") }}
        >
          {keys.map((size) => (
            <li key={size}>
              <figure className="gl-product-size-guide-option">
                <div className="gl-product-size-guide-frame">
                  <div className="gl-product-size-guide-photo">
                    <Image
                      src={product.image}
                      alt={`${product.name}, ${SIZE_NAMES[size]} box size reference`}
                      fill
                      sizes="(min-width: 861px) 186px, 106px"
                      className="gl-product-size-guide-image"
                    />
                  </div>
                </div>
                <figcaption className="gl-product-size-guide-caption">
                  <span className="gl-product-size-guide-measure">
                    <span aria-hidden="true" className="gl-product-size-guide-tick" />
                    <span aria-hidden="true" className="gl-product-size-guide-line" />
                    <span>{SIZE_INCHES[size]}</span>
                    <span aria-hidden="true" className="gl-product-size-guide-line" />
                    <span aria-hidden="true" className="gl-product-size-guide-tick" />
                  </span>
                  <span className="gl-product-size-guide-name">{SIZE_NAMES[size]}</span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
