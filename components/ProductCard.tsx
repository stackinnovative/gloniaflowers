"use client";

import Image from "next/image";
import Link from "next/link";
import { getCollection, priceLabel, SIZE_INCHES, type Product } from "@/lib/products";
import { buildOrderMessage, waLink } from "@/lib/whatsapp";
import { useCart } from "./CartProvider";
import { CartIcon } from "./Icons";
import "./ProductCard.css";

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const { items, add } = useCart();
  const size = product.sizes ? "S" : null;
  const quantity = items.reduce((total, item) => (
    item.slug === product.slug && item.size === size && item.addOns.length === 0 && !item.delivery && !item.cardMessage
      ? total + item.qty
      : total
  ), 0);
  const sizeDescription = size ? ", Small (S)" : "";
  const sizeHintId = `product-card-size-${product.slug}`;
  const buyHref = waLink(buildOrderMessage([{
    name: product.name,
    size,
    qty: 1,
    unitPrice: product.sizes?.S ?? product.price,
    addOns: [],
  }]));

  return (
    <article className="gl-product-card" data-product-slug={product.slug}>
      <Link
        href={`/product/${product.slug}`}
        prefetch={false}
        className="gl-product-card-details"
      >
        <div className="gl-product-card-frame">
          <div className="gl-product-card-photo">
            <Image
              src={product.image}
              alt={product.name}
              fill
              priority={priority}
              fetchPriority={priority ? "high" : undefined}
              sizes="(min-width: 1320px) 280px, (min-width: 861px) 30vw, (min-width: 600px) 45vw, 44vw"
              className="gl-product-card-image"
            />
            <span className="gl-product-card-category">{getCollection(product.collection)?.name}</span>
            {product.sizes && <span className="gl-product-card-sizes">S · M · L</span>}
          </div>
        </div>
        <h3 className="gl-product-card-name">{product.name}</h3>
        <p className="gl-product-card-price">{priceLabel(product)}</p>
      </Link>
      <div className="gl-product-card-order">
        {size && <p id={sizeHintId} className="gl-product-card-size-hint">Small (S) selected · {SIZE_INCHES.S}</p>}
        <div className="gl-product-card-actions">
          <button
            type="button"
            onClick={() => add({ slug: product.slug, size, addOns: [] })}
            aria-label={quantity > 0
              ? `Added · ${quantity}. Add one more ${product.name}${sizeDescription} to cart`
              : `Add to cart — ${product.name}${sizeDescription}`}
            aria-describedby={size ? sizeHintId : undefined}
            className="gl-product-card-add"
            data-added={quantity > 0}
          >
            {quantity > 0 ? (
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true">
                <path d="M3 8.5l3 3 7-7" />
              </svg>
            ) : <CartIcon size={14} />}
            <span>{quantity > 0 ? `Added · ${quantity}` : "Add to cart"}</span>
          </button>
          <a
            href={buyHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Buy now — ${product.name}${sizeDescription} on WhatsApp`}
            aria-describedby={size ? sizeHintId : undefined}
            className="gl-product-card-buy"
          >
            Buy now
          </a>
        </div>
      </div>
    </article>
  );
}
