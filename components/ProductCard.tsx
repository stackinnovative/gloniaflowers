"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { getCollection, priceLabel, SIZE_INCHES, SIZE_KEYS, SIZE_NAMES, type Product, type SizeKey } from "@/lib/products";
import { formatPrice } from "@/lib/whatsapp";
import "./ProductCard.css";

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const [size, setSize] = useState<SizeKey>("S");
  const sizes = product.sizes;
  // The chosen size travels to the product page, where date, slot and add-ons are picked.
  const detailsHref = `/product/${product.slug}${sizes ? `?size=${size}` : ""}`;
  const sizeDescription = sizes ? `, ${SIZE_NAMES[size]} (${size})` : "";

  return (
    <article className="gl-product-card" data-product-slug={product.slug}>
      <div className="gl-product-card-frame">
        <div className="gl-product-card-photo">
          {/* Duplicate of the name link below, kept out of the tab order. */}
          <Link href={detailsHref} prefetch={false} tabIndex={-1} aria-hidden="true" className="gl-product-card-photo-link">
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
          </Link>
          {/* The size badge on the photo is the selector; it sits outside the link so taps don't navigate. */}
          {sizes && (
            <div className="gl-product-card-sizes" role="group" aria-label={`Size for ${product.name}`}>
              {SIZE_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={size === key}
                  aria-label={`${SIZE_NAMES[key]}, ${SIZE_INCHES[key]}, ${formatPrice(sizes[key])}`}
                  title={`${SIZE_NAMES[key]} · ${SIZE_INCHES[key]}`}
                  onClick={() => setSize(key)}
                >
                  {key}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <Link href={detailsHref} prefetch={false} className="gl-product-card-details">
        <h3 className="gl-product-card-name">{product.name}</h3>
        <p className="gl-product-card-price" aria-live="polite">{sizes ? `${formatPrice(sizes[size])} · ${SIZE_NAMES[size]}` : priceLabel(product)}</p>
      </Link>
      {/* Ordering happens on the product page, after choosing date, slot and add-ons. */}
      <div className="gl-product-card-order">
        <Link
          href={detailsHref}
          prefetch={false}
          aria-label={`Buy now — ${product.name}${sizeDescription}`}
          className="gl-product-card-buy"
        >
          Buy now
        </Link>
      </div>
    </article>
  );
}
