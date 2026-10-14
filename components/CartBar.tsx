"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { buildOrderMessage, formatPrice, waLink } from "@/lib/whatsapp";
import { isValidDeliveryDate, todayInIndia } from "@/lib/delivery";
import { useCart } from "./CartProvider";
import { CartIcon, CloseIcon, WhatsAppIcon } from "./Icons";
import "./CartBar.css";

export function CartBar() {
  const { items, count, total, orderLines, hasUnpricedAddOns, hasExpiredDelivery, clear } = useCart();
  const bar = useRef<HTMLElement>(null);
  const [height, setHeight] = useState<number | null>(null);
  const [checkoutDate, setCheckoutDate] = useState<string | null>(null);
  const hasItems = count > 0;
  const expiredDelivery = hasExpiredDelivery || (checkoutDate !== null && items.some((item) => item.delivery && !isValidDeliveryDate(item.delivery.date, checkoutDate)));

  function validateCheckout(event: MouseEvent<HTMLAnchorElement>) {
    // Recheck every activation path if midnight passed between clock updates.
    const today = todayInIndia();
    if (items.some((item) => item.delivery && !isValidDeliveryDate(item.delivery.date, today))) {
      event.preventDefault();
      setCheckoutDate(today);
    }
  }

  useEffect(() => {
    const element = bar.current;
    if (!hasItems || !element) return;
    const observer = new ResizeObserver(() => setHeight(element.getBoundingClientRect().height));
    observer.observe(element);
    return () => observer.disconnect();
  }, [hasItems]);

  if (!hasItems) return null;

  return (
    <>
      <div aria-hidden="true" className="gl-cart-spacer" style={height === null ? undefined : { height: `calc(${height}px + var(--gl-cart-bottom-space))` }} />
      <aside id="cart" ref={bar} tabIndex={-1} aria-label="Shopping cart" className="gl-cart-bar">
        <div className="gl-cart-inner">
          <div className="gl-cart-summary">
            <CartIcon size={20} stroke="#D9BE84" className="gl-cart-bag" />
            <div className="gl-cart-status" role="status" aria-live="polite" aria-atomic="true">
              <p className="gl-cart-count">Cart · {count} {count === 1 ? "item" : "items"}</p>
              <p className="gl-cart-total">{formatPrice(total)}{hasUnpricedAddOns ? " + add-ons to confirm" : ""}</p>
            </div>
          </div>
          <button type="button" onClick={clear} aria-label="Clear cart" className="gl-cart-clear">
            <CloseIcon size={16} stroke="#D9BE84" className="gl-cart-clear-icon" />
            <span className="gl-cart-clear-label">Clear</span>
          </button>
          {expiredDelivery ? (
            <button type="button" disabled aria-label="Checkout on WhatsApp" aria-describedby="cart-delivery-warning" className="gl-cart-checkout">
              <WhatsAppIcon size={15} stroke="#1A1A1A" />
              <span>Checkout<span className="gl-cart-checkout-extra"> on WhatsApp</span></span>
            </button>
          ) : (
            <a
              href={waLink(buildOrderMessage(orderLines))}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Checkout on WhatsApp"
              className="gl-cart-checkout"
              onClick={validateCheckout}
              onAuxClick={validateCheckout}
              onContextMenu={validateCheckout}
            >
              <WhatsAppIcon size={15} stroke="#1A1A1A" />
              <span>Checkout<span className="gl-cart-checkout-extra"> on WhatsApp</span></span>
            </a>
          )}
          {expiredDelivery && (
            <p id="cart-delivery-warning" role="status" className="gl-cart-delivery-warning">
              A delivery date has passed. Clear the cart and choose a new date.
            </p>
          )}
        </div>
      </aside>
    </>
  );
}
