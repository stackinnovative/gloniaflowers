"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { formatPrice } from "@/lib/whatsapp";
import { CartCheckout } from "./CartCheckout";
import { useCart } from "./CartProvider";
import { CartIcon, WhatsAppIcon } from "./Icons";
import "./CartBar.css";

export function CartBar() {
  const { count, total, hasUnpricedAddOns } = useCart();
  const pathname = usePathname();
  const bar = useRef<HTMLElement>(null);
  const [height, setHeight] = useState<number | null>(null);
  // The cart page has its own summary and checkout.
  const visible = count > 0 && pathname !== "/cart";

  useEffect(() => {
    const element = bar.current;
    if (!visible || !element) return;
    const observer = new ResizeObserver(() => setHeight(element.getBoundingClientRect().height));
    observer.observe(element);
    return () => observer.disconnect();
  }, [visible]);

  if (!visible) return null;

  return (
    <>
      <div aria-hidden="true" className="gl-cart-spacer" style={height === null ? undefined : { height: `calc(${height}px + var(--gl-cart-bottom-space))` }} />
      <aside ref={bar} aria-label="Shopping cart" className="gl-cart-bar">
        <div className="gl-cart-inner">
          <div className="gl-cart-summary">
            <CartIcon size={20} stroke="#D9BE84" className="gl-cart-bag" />
            <div className="gl-cart-status" role="status" aria-live="polite" aria-atomic="true">
              <p className="gl-cart-count">Cart · {count} {count === 1 ? "item" : "items"}</p>
              <p className="gl-cart-total">{formatPrice(total)}{hasUnpricedAddOns ? " + add-ons to confirm" : ""}</p>
            </div>
          </div>
          <Link href="/cart" prefetch={false} aria-label="View cart" className="gl-cart-view">
            <CartIcon size={18} stroke="#D9BE84" className="gl-cart-view-icon" />
            <span className="gl-cart-view-label">View cart</span>
          </Link>
          <CartCheckout
            className="gl-cart-checkout"
            warningId="cart-delivery-warning"
            renderWarning={(id) => (
              <p id={id} role="status" className="gl-cart-delivery-warning">
                A delivery date has passed. <Link href="/cart" prefetch={false}>Open your cart</Link> to update it.
              </p>
            )}
          >
            <WhatsAppIcon size={15} stroke="#1A1A1A" />
            <span>Checkout<span className="gl-cart-checkout-extra"> on WhatsApp</span></span>
          </CartCheckout>
        </div>
      </aside>
    </>
  );
}
