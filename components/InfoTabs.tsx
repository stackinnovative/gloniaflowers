"use client";

import { useId, useRef, useState } from "react";
import type { Product } from "@/lib/products";
import { site } from "@/lib/site";
import "./InfoTabs.css";

const tabs = [
  { id: "details", label: "Details" },
  { id: "care", label: "Care" },
  { id: "delivery", label: "Delivery" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function InfoTabs({ product }: { product: Product }) {
  const [active, setActive] = useState<TabId>("details");
  const prefix = useId();
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);
  const content: Record<TabId, string[]> = {
    details: [
      product.description,
      ...(product.sizes ? ["Available in Small, Medium and Large."] : []),
      "Flower shade may change depending on availability.",
    ],
    care: product.sizes ? [
      "Keep in a cool place, away from direct sun.",
      "Mist the flowers lightly once a day.",
      "Do not add water to the box.",
    ] : [
      "Keep in a cool place, away from direct sun.",
      "Place unwrapped stems in a clean vase with fresh water.",
      "Refresh the water daily.",
    ],
    delivery: [
      `Shop hours: ${site.hours.label}.`,
      `Same-day delivery cut-off: ${site.sameDayCutoff}. Please confirm on WhatsApp.`,
      "Confirm delivery availability and charges with us on WhatsApp.",
    ],
  };

  function activate(index: number) {
    const next = (index + tabs.length) % tabs.length;
    setActive(tabs[next].id);
    buttons.current[next]?.focus();
  }

  return (
    <div className="gl-product-info">
      <div role="tablist" aria-label={`${product.name} information`} className="gl-product-info-tabs">
        {tabs.map((tab, index) => (
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
                activate(event.key === "Home" ? 0 : tabs.length - 1);
              }
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab) => (
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
