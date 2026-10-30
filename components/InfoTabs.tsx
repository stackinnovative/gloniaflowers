"use client";

import { useId, useRef, useState } from "react";
import { isSimpleProduct, sizeKeys, sizeNamesList, type Product } from "@/lib/products";
import { site } from "@/lib/site";
import "./InfoTabs.css";

const tabs = [
  { id: "details", label: "Details" },
  { id: "care", label: "Care" },
  { id: "delivery", label: "Delivery" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function InfoTabs({ product }: { product: Product }) {
  // Chocolates, perfumes and gifts show only the description in Details, and have no Care tab.
  const simple = isSimpleProduct(product);
  const visibleTabs = simple ? tabs.filter((tab) => tab.id !== "care") : tabs;
  const [active, setActive] = useState<TabId>("details");
  const prefix = useId();
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);
  // Shared lines are edited in Sanity (Site settings → Product page info).
  const { productInfo } = site;
  const content: Record<TabId, string[]> = {
    details: simple
      ? [product.description]
      : [
          product.description,
          ...(product.sizes ? [`Available in ${sizeNamesList(sizeKeys(product.sizes))}.`] : []),
          ...productInfo.details,
        ],
    care: product.sizes ? productInfo.careBox : productInfo.careBouquet,
    delivery: [
      `Shop hours: ${site.hours.label}.`,
      ...productInfo.delivery,
    ],
  };

  function activate(index: number) {
    const next = (index + visibleTabs.length) % visibleTabs.length;
    setActive(visibleTabs[next].id);
    buttons.current[next]?.focus();
  }

  return (
    <div className="gl-product-info">
      <div role="tablist" aria-label={`${product.name} information`} className="gl-product-info-tabs">
        {visibleTabs.map((tab, index) => (
          <button
            key={tab.id}
            ref={(button) => { buttons.current[index] = button; }}
            id={`${prefix}-tab-${tab.id}`}
            type="button"
            role="tab"
            aria-selected={active === tab.id}
            aria-controls={`${prefix}-panel-${tab.id}`}
            tabIndex={active === tab.id ? 0 : -1}
            onClick={() => setActive(tab.id)}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
                event.preventDefault();
                activate(index + (event.key === "ArrowRight" ? 1 : -1));
              } else if (event.key === "Home" || event.key === "End") {
                event.preventDefault();
                activate(event.key === "Home" ? 0 : visibleTabs.length - 1);
              }
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {visibleTabs.map((tab) => (
        <div
          key={tab.id}
          id={`${prefix}-panel-${tab.id}`}
          role="tabpanel"
          aria-labelledby={`${prefix}-tab-${tab.id}`}
          hidden={active !== tab.id}
          tabIndex={0}
          className="gl-product-info-panel"
        >
          <ul>{content[tab.id].map((line) => <li key={line}>{line}</li>)}</ul>
        </div>
      ))}
    </div>
  );
}
