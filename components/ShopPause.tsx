"use client";

import Link from "next/link";
import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";
import { subscribeIndiaDate } from "@/lib/delivery";
import { isShopPaused } from "@/lib/shopPause";
import { site } from "@/lib/site";
import { waLink } from "@/lib/whatsapp";
import { CatalogDecoration } from "./Catalog";
import { WhatsAppIcon } from "./Icons";
import "./ShopPause.css";

// The pause state when the page was built, so the static HTML and hydration agree.
const PausedAtBuild = createContext(false);

export function ShopPauseProvider({ pausedAtBuild, children }: { pausedAtBuild: boolean; children: ReactNode }) {
  return <PausedAtBuild.Provider value={pausedAtBuild}>{children}</PausedAtBuild.Provider>;
}

/** Whether online ordering is paused right now; rechecked every minute, so a scheduled pause starts and ends on time. */
export function useShopPaused(): boolean {
  const pausedAtBuild = useContext(PausedAtBuild);
  return useSyncExternalStore(subscribeIndiaDate, () => isShopPaused(), () => pausedAtBuild);
}

/** Shows `children` while the shop is open, and `paused` (nothing by default) while it is paused. */
export function ShopGate({ children, paused = null }: { children: ReactNode; paused?: ReactNode }) {
  return useShopPaused() ? paused : children;
}

type ShopLinkProps = {
  href: string;
  className?: string;
  prefetch?: boolean;
  /** WhatsApp message while paused; defaults to the pause message in Site settings. */
  whatsapp?: string;
  /** Replaces the link text while paused, e.g. "Shop the collection" → "Message us on WhatsApp". */
  pausedLabel?: ReactNode;
  children: ReactNode;
};

/** A link into the shop that opens WhatsApp instead while the shop is paused, so the home page stays a showcase. */
export function ShopLink({ href, className, prefetch, whatsapp, pausedLabel, children }: ShopLinkProps) {
  if (!useShopPaused()) return <Link href={href} prefetch={prefetch} className={className}>{children}</Link>;
  return (
    <a href={waLink(whatsapp ?? site.shopPause.whatsappMessage)} target="_blank" rel="noopener noreferrer" className={className}>
      {pausedLabel ?? children}
    </a>
  );
}

function WhatsAppButton() {
  return (
    <a href={waLink(site.shopPause.whatsappMessage)} target="_blank" rel="noopener noreferrer" className="gl-shop-paused-button">
      <WhatsAppIcon size={16} stroke="#D9BE84" />{site.shopPause.buttonLabel}
    </a>
  );
}

/** Replaces the catalogue, product and cart pages while the shop is paused. */
export function ShopClosed() {
  return (
    <div className="gl-shop-paused">
      <section className="gl-catalog-header" aria-labelledby="shop-paused-heading">
        <div className="gl-catalog-title-region">
          <CatalogDecoration />
          <div className="gl-catalog-title-content">
            <h1 id="shop-paused-heading">{site.shopPause.title}</h1>
          </div>
        </div>
      </section>
      <div className="gl-shop-paused-actions">
        <p className="gl-shop-paused-message">{site.shopPause.message}</p>
        <WhatsAppButton />
        <Link href="/" className="gl-shop-paused-home">Back to home</Link>
      </div>
    </div>
  );
}

/** Message strip at the top of the home page while the shop is paused. */
export function ShopPauseBanner() {
  if (!useShopPaused()) return null;
  return (
    <section className="gl-shop-paused-banner" aria-labelledby="shop-paused-banner-heading">
      <div className="gl-shop-paused-banner-text">
        <h2 id="shop-paused-banner-heading">{site.shopPause.title}</h2>
        <p>{site.shopPause.message}</p>
      </div>
      <WhatsAppButton />
    </section>
  );
}
