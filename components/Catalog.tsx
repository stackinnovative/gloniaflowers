"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { catalogProducts, priceFilters, type CatalogSort, type PriceFilter } from "@/lib/catalog";
import { getCollections, type Collection } from "@/lib/products";
import { waLink } from "@/lib/whatsapp";
import { CustomOrderCard } from "./CustomOrderCard";
import { FloralCorner } from "./FloralCorner";
import { LeafIcon, WhatsAppIcon } from "./Icons";
import { ProductCard } from "./ProductCard";
import "./Catalog.css";

const collections: Collection[] = [{ id: "all", name: "All flowers", order: 0, image: "/images/products/blush-rose-blooming-box.jpg" }, ...getCollections()];
const titles: Record<string, [string, string]> = {
  all: ["All", "flowers"], korean: ["Korean", "bouquets"], premium: ["Premium", "bouquets"],
  custom: ["Customized", "bouquets"], choco: ["Chocolate", "bouquets"], red: ["Red", "roses"],
  classic: ["Classic", "boxes"], bloom: ["Blooming", "boxes"], bridal: ["Bridal", "collection"],
  car: ["Car", "décor"], gifts: ["Thoughtful", "gifts"],
};

function updateFilter(key: "c" | "price" | "sort", value: string) {
  const url = new URL(window.location.href);
  if (["all", "any", "featured"].includes(value)) url.searchParams.delete(key);
  else url.searchParams.set(key, value);
  url.hash = "";
  // Next's native history integration updates useSearchParams without a server request.
  window.history.pushState(null, "", `${url.pathname}${url.search}`);
}

export function CatalogDecoration() {
  return (
    <div className="gl-catalog-decoration" aria-hidden="true">
      <div className="gl-catalog-frame" />
      <div className="gl-catalog-frame-inner" />
      {["tl", "tr", "bl", "br"].map((corner) => <span key={corner} className={`gl-catalog-diamond gl-catalog-diamond-${corner}`} />)}
      <FloralCorner corner="tl" src="tl" className="gl-catalog-floral" />
      <FloralCorner corner="br" src="br" className="gl-catalog-floral" />
      {["one", "two", "three", "four"].map((sparkle) => (
        <svg key={sparkle} className={`gl-tw gl-catalog-sparkle gl-catalog-sparkle-${sparkle}`} viewBox="0 0 16 16" focusable="false">
          <path d="M8 0L9.6 6.4L16 8L9.6 9.6L8 16L6.4 9.6L0 8L6.4 6.4Z" fill="currentColor" />
        </svg>
      ))}
    </div>
  );
}

/** Collections added in the CMS: first word upright, the rest in italics. */
function splitTitle(name: string): [string, string] {
  const [first, ...rest] = name.split(" ");
  return [first, rest.join(" ")];
}

// `year` is set when the page is built (the site rebuilds on every content change).
type CatalogContentProps = { year: number; collectionId?: string; priceId?: string; sortId?: string };

export function CatalogContent({ year, collectionId = "all", priceId = "any", sortId = "featured" }: CatalogContentProps) {
  const active = collections.find((collection) => collection.id === collectionId) ?? collections[0];
  const price: PriceFilter = priceFilters.find((filter) => filter.id === priceId)?.id ?? "any";
  const sort: CatalogSort = sortId === "low" || sortId === "high" ? sortId : "featured";
  const [title, italicTitle] = titles[active.id] ?? splitTitle(active.name);
  const products = catalogProducts(active.id, price, sort);
  const collectionIsEmpty = catalogProducts(active.id, "any", "featured").length === 0;
  const collectionRow = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const row = collectionRow.current;
    const button = row?.querySelector<HTMLButtonElement>('[aria-pressed="true"]');
    if (!row || !button) return;
    const bounds = row.getBoundingClientRect();
    const selected = button.getBoundingClientRect();
    if (selected.left < bounds.left || selected.right > bounds.right) {
      row.scrollLeft += selected.left - bounds.left - (bounds.width - selected.width) / 2;
    }
  }, [active.id]);

  return (
    <div className="gl-catalog">
      <section className="gl-catalog-header" aria-labelledby="catalog-heading">
        <div className="gl-catalog-title-region">
          <CatalogDecoration />
          <div className="gl-catalog-title-content">
            <nav className="gl-catalog-breadcrumb" aria-label="Breadcrumb">
              <Link href="/">Home</Link><span aria-hidden="true"> / </span>
              <Link href="/catalog">Shop</Link><span aria-hidden="true"> / </span>
              <span aria-current="page">{active.name}</span>
            </nav>
            <p className="gl-catalog-accent">Catalogue {year}</p>
            <h1 id="catalog-heading">{title} <em>{italicTitle}</em></h1>
            <p className="gl-catalog-shade">We use fresh flowers in all our floral arrangements</p>
          </div>
        </div>
        <div ref={collectionRow} className="gl-catalog-collections gl-row" role="group" aria-label="Filter by collection">
          {collections.map((collection) => {
            const { image } = collection;
            return (
              <button key={collection.id} type="button" className="gl-catalog-collection" aria-pressed={active.id === collection.id} aria-controls="catalog-results" onClick={() => updateFilter("c", collection.id)}>
                <span className="gl-catalog-bubble">
                  {image ? <Image src={image} width={80} height={80} sizes="(min-width: 861px) 78px, 58px" alt="" /> : <span className="gl-catalog-bubble-placeholder"><LeafIcon size={24} /></span>}
                </span>
                <span>{collection.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="gl-catalog-shop" aria-label="Shop flowers">
        <div className="gl-catalog-toolbar">
          <div className="gl-catalog-controls gl-row">
          <label className="gl-catalog-sort">
            <span>Sort</span>
            <select value={sort} aria-label="Sort products" onChange={(event) => updateFilter("sort", event.target.value)}>
              <option value="featured">Featured</option>
              <option value="low">Price: low to high</option>
              <option value="high">Price: high to low</option>
            </select>
          </label>
          <div className="gl-catalog-prices" role="group" aria-label="Filter by price">
            {priceFilters.map((filter) => (
              <button type="button" key={filter.id} aria-pressed={filter.id === price} aria-controls="catalog-results" onClick={() => updateFilter("price", filter.id)}>{filter.name}</button>
            ))}
          </div>
          </div>
          <p className="gl-catalog-count" role="status" aria-live="polite" aria-atomic="true">{products.length} {products.length === 1 ? "design" : "designs"}<span className="sr-only"> in {active.name}</span></p>
        </div>

        <div id="catalog-results">
          {products.length ? (
            <div className="gl-catalog-grid">
              <h2 className="sr-only">Flower designs</h2>
              {products.map((product, index) => <ProductCard key={product.slug} product={product} priority={index < 2} />)}
              <CustomOrderCard />
            </div>
          ) : (
            <div className="gl-catalog-empty">
              <p className="gl-catalog-empty-accent">{collectionIsEmpty ? "Coming soon" : "Keep looking"}</p>
              <h2>{collectionIsEmpty ? "New designs on the way" : "No designs at this price"}</h2>
              <p>{collectionIsEmpty ? "Message us and we’ll share available options and prices." : "Try another price range to see more flowers in this collection."}</p>
              {!collectionIsEmpty && <button type="button" className="gl-catalog-reset" onClick={() => updateFilter("price", "any")}>Show all prices</button>}
              <a href={waLink(`Hi GLONIA, I'm interested in ${active.name}. Please share available designs and prices.`)} target="_blank" rel="noopener noreferrer" className="gl-catalog-enquire"><WhatsAppIcon size={16} />Ask on WhatsApp</a>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export function Catalog({ year }: { year: number }) {
  const searchParams = useSearchParams();
  return <CatalogContent year={year} collectionId={searchParams.get("c") ?? "all"} priceId={searchParams.get("price") ?? "any"} sortId={searchParams.get("sort") ?? "featured"} />;
}
