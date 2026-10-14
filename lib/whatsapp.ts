import { site, type DeliverySlot } from "./site";
import { isValidDeliveryDate } from "./delivery";

export type OrderLine = {
  name: string;
  size: string | null;
  qty: number;
  /** Price of one item including add-ons with confirmed prices. */
  unitPrice: number;
  addOns: string[];
  hasUnpricedAddOns?: boolean;
  delivery?: Delivery;
  cardMessage?: string;
};

export type Delivery = { date: string; slot: DeliverySlot };

export function formatPrice(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

/** wa.me link, optionally with a prefilled message. Open in a new tab. */
export function waLink(message?: string): string {
  const base = `https://wa.me/${site.whatsappNumber}`;
  // A malformed saved message can contain lone UTF-16 surrogates; keep the link usable.
  const safeMessage = message?.replace(/[\uD800-\uDFFF]/gu, "\uFFFD");
  return safeMessage ? `${base}?text=${encodeURIComponent(safeMessage)}` : base;
}

/** "2026-10-14" → "14 Oct 2026" */
export function formatDeliveryDate(isoDate: string): string {
  if (!isValidDeliveryDate(isoDate)) return isoDate;
  return new Date(`${isoDate}T00:00:00.000Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function formatLine(line: OrderLine, fallbackDelivery?: Delivery): string {
  const parts = [line.qty > 1 ? `${line.name} × ${line.qty}` : line.name];
  if (line.size) parts.push(`Size ${line.size}`);
  parts.push(formatPrice(line.unitPrice * line.qty));
  const out = [`• ${parts.join(" — ")}`];
  if (line.addOns.length) out.push(`  Add-ons: ${line.addOns.join(", ")}`);
  const delivery = line.delivery ?? fallbackDelivery;
  if (delivery) out.push(`  Delivery: ${formatDeliveryDate(delivery.date)}, ${delivery.slot}`);
  if (line.cardMessage) out.push(`  Card message: ${line.cardMessage.replace(/\r?\n/g, "\n  ")}`);
  return out.join("\n");
}

export function buildOrderMessage(lines: OrderLine[], delivery?: Delivery): string {
  const total = lines.reduce((sum, l) => sum + l.unitPrice * l.qty, 0);
  const hasLineDelivery = lines.some((line) => line.delivery !== undefined);
  const out = ["Hi GLONIA, I'd like to order:", ...lines.map((line) => formatLine(line, hasLineDelivery ? delivery : undefined))];
  if (delivery?.date && !hasLineDelivery) out.push(`Delivery: ${formatDeliveryDate(delivery.date)}, ${delivery.slot}`);
  const unpricedNote = lines.some((line) => line.hasUnpricedAddOns) ? " + add-ons to confirm" : "";
  out.push(`Total: ${formatPrice(total)}${unpricedNote}`, "Name:", "Address:");
  return out.join("\n");
}

export const perfumeNotifyMessage = "Hi GLONIA, please let me know when your perfumes launch.";
export const customOrderMessage =
  "Hi GLONIA, I'd like a custom bouquet.\nColours: \nBudget: \nDelivery date: ";
