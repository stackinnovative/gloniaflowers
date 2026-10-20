import { site, type DeliverySlot } from "./site";
import { isValidDeliveryDate } from "./delivery";

export type OrderLine = {
  name: string;
  size: string | null;
  qty: number;
  /** Price of one item including add-ons with confirmed prices. */
  unitPrice: number;
  addOns: OrderAddOn[];
  hasUnpricedAddOns?: boolean;
  delivery?: Delivery;
  cardMessage?: string;
};

export type OrderAddOn = { id: string; name: string; priced: boolean };

// Add-ons that get their own line in the order message.
const CHOCOLATES_ID = "choc";
const CARD_ID = "card";

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

/** "Chocolates" or "Chocolates (price to confirm)" */
export function addOnLabel(addOn: OrderAddOn): string {
  return addOn.priced ? addOn.name : `${addOn.name} (price to confirm)`;
}

const UNPRICED_NOTE = " + add-ons to confirm";

function formatLine(line: OrderLine, showUnpricedNote: boolean): string {
  const price = `${formatPrice(line.unitPrice * line.qty)}${showUnpricedNote && line.hasUnpricedAddOns ? UNPRICED_NOTE : ""}`;
  const chocolates = line.addOns.find((addOn) => addOn.id === CHOCOLATES_ID);
  const hasCard = line.addOns.some((addOn) => addOn.id === CARD_ID);
  const others = line.addOns.filter((addOn) => addOn.id !== CHOCOLATES_ID && addOn.id !== CARD_ID);
  const card = line.cardMessage ? line.cardMessage.replace(/\r?\n/g, "\n  ") : hasCard ? "Yes" : "Nil";
  return [
    `* ${line.qty > 1 ? `${line.name} × ${line.qty}` : line.name}`,
    line.size ? `* Size ${line.size} — ${price}` : `* Price: ${price}`,
    `* Add-ons: ${others.length ? others.map(addOnLabel).join(", ") : "Nil"}`,
    `* Chocolates: ${chocolates ? (chocolates.priced ? "Yes" : "Yes (price to confirm)") : "Nil"}`,
    `* Message card: ${card}`,
    "",
    `Delivery Date: ${line.delivery ? formatDeliveryDate(line.delivery.date) : ""}`,
    `Delivery Time: ${line.delivery?.slot ?? ""}`,
  ].join("\n");
}

export function buildOrderMessage(lines: OrderLine[]): string {
  const single = lines.length === 1;
  const out = [`Hi GLONIA, I'd like to order:\n${lines.map((line) => formatLine(line, single)).join("\n\n")}`];
  if (!single) {
    const total = lines.reduce((sum, l) => sum + l.unitPrice * l.qty, 0);
    const unpricedNote = lines.some((line) => line.hasUnpricedAddOns) ? UNPRICED_NOTE : "";
    out.push(`Total: ${formatPrice(total)}${unpricedNote}`);
  }
  out.push(
    "Customization (optional): ",
    ["Receiver Name: ", "Receiver Number: ", "Delivery Location (map link/ address): "].join("\n"),
  );
  return out.join("\n\n");
}

export const perfumeNotifyMessage = "Hi GLONIA, please let me know when your perfumes launch.";
export const customOrderMessage =
  "Hi GLONIA, I'd like a custom bouquet.\nColours: \nBudget: \nDelivery date: ";
