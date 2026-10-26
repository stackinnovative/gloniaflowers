"use client";

import { useState, type MouseEvent, type ReactNode } from "react";
import { buildOrderMessage, waLink } from "@/lib/whatsapp";
import { isDeliveryClosed } from "@/lib/delivery";
import { useCart } from "./CartProvider";

type Props = {
  className: string;
  /** Id of the element that explains why checkout is disabled. */
  warningId: string;
  children: ReactNode;
  renderWarning: (id: string) => ReactNode;
};

/** WhatsApp checkout link for the whole cart, disabled while any delivery date or same-day time has passed. */
export function CartCheckout({ className, warningId, children, renderWarning }: Props) {
  const { items, orderLines, hasExpiredDelivery } = useCart();
  const [checkedAt, setCheckedAt] = useState<number | null>(null);
  const expired = hasExpiredDelivery || (checkedAt !== null && items.some((item) => item.delivery && isDeliveryClosed(item.delivery, new Date(checkedAt))));

  function validate(event: MouseEvent<HTMLAnchorElement>) {
    // Recheck every activation path in case a date or slot closed between clock updates.
    const now = Date.now();
    if (items.some((item) => item.delivery && isDeliveryClosed(item.delivery, new Date(now)))) {
      event.preventDefault();
      setCheckedAt(now);
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
