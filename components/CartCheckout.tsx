"use client";

import { useState, type MouseEvent, type ReactNode } from "react";
import { buildOrderMessage, waLink } from "@/lib/whatsapp";
import { isValidDeliveryDate, todayInIndia } from "@/lib/delivery";
import { useCart } from "./CartProvider";

type Props = {
  className: string;
  /** Id of the element that explains why checkout is disabled. */
  warningId: string;
  children: ReactNode;
  renderWarning: (id: string) => ReactNode;
};

/** WhatsApp checkout link for the whole cart, disabled while any delivery date has passed. */
export function CartCheckout({ className, warningId, children, renderWarning }: Props) {
  const { items, orderLines, hasExpiredDelivery } = useCart();
  const [checkoutDate, setCheckoutDate] = useState<string | null>(null);
  const expired = hasExpiredDelivery || (checkoutDate !== null && items.some((item) => item.delivery && !isValidDeliveryDate(item.delivery.date, checkoutDate)));

  function validate(event: MouseEvent<HTMLAnchorElement>) {
    // Recheck every activation path if midnight passed between clock updates.
    const today = todayInIndia();
    if (items.some((item) => item.delivery && !isValidDeliveryDate(item.delivery.date, today))) {
      event.preventDefault();
      setCheckoutDate(today);
    }
  }

  return (
    <>
      {expired ? (
        <button type="button" disabled aria-label="Checkout on WhatsApp" aria-describedby={warningId} className={className}>
          {children}
        </button>
      ) : (
        <a
          href={waLink(buildOrderMessage(orderLines))}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Checkout on WhatsApp"
          className={className}
          onClick={validate}
          onAuxClick={validate}
          onContextMenu={validate}
        >
          {children}
        </a>
      )}
      {expired && renderWarning(warningId)}
    </>
  );
}
