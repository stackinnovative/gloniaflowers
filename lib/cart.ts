import { getProduct, type SizeKey } from "./products";
import { isValidDeliveryDate } from "./delivery";
import { addOns, deliverySlots, type AddOn } from "./site";
import type { Delivery, OrderLine } from "./whatsapp";

export type CartItem = {
  slug: string;
  size: SizeKey | null;
  addOns: string[];
  qty: number;
  delivery?: Delivery;
  cardMessage?: string;
};

export type CartSelection = Omit<CartItem, "qty">;

type PricedAddOn = AddOn & { price: number };

function hasConfirmedPrice(addOn: AddOn): addOn is PricedAddOn {
  return addOn.price !== null && Number.isFinite(addOn.price) && addOn.price >= 0;
}

function readDelivery(value: unknown): Delivery | null {
  if (typeof value !== "object" || value === null) return null;
  const candidate = value as Record<string, unknown>;
  if (typeof candidate.date !== "string" || !isValidDeliveryDate(candidate.date)) return null;
  const slot = deliverySlots.find((slot) => slot === candidate.slot);
  return slot ? { date: candidate.date, slot } : null;
}

function readItem(value: unknown): CartItem | null {
  if (typeof value !== "object" || value === null) return null;
  const candidate = value as Record<string, unknown>;
  if (typeof candidate.slug !== "string" || typeof candidate.qty !== "number" || !Number.isSafeInteger(candidate.qty) || candidate.qty <= 0) return null;
  const product = getProduct(candidate.slug);
  if (!product || !Array.isArray(candidate.addOns)) return null;
  const requestedAddOns: unknown[] = candidate.addOns;
  if (!requestedAddOns.every((id) => typeof id === "string" && addOns.some((addOn) => addOn.id === id))) return null;

  let size: SizeKey | null = null;
  if (product.sizes) {
    // Earlier carts can omit the selection by storing null; catalogue orders use Small.
    if (candidate.size === null) size = "S";
    else if (candidate.size === "S" || candidate.size === "M" || candidate.size === "L") size = candidate.size;
    else return null;
  } else if (candidate.size !== null) return null;

  const delivery = candidate.delivery === undefined ? undefined : readDelivery(candidate.delivery);
  if (delivery === null || (candidate.cardMessage !== undefined && typeof candidate.cardMessage !== "string")) return null;
  const cardMessage = typeof candidate.cardMessage === "string"
    ? Array.from(candidate.cardMessage.replace(/\r\n?/g, "\n").trim()).slice(0, 500).join("")
    : "";

  return {
    slug: product.slug,
    size,
    addOns: addOns.filter((addOn) => requestedAddOns.includes(addOn.id)).map((addOn) => addOn.id),
    qty: candidate.qty,
    ...(delivery ? { delivery } : {}),
    ...(cardMessage ? { cardMessage } : {}),
  };
}

/** Identity of a cart line: same product, size, add-ons, delivery and card message. */
export function cartLineKey(item: CartSelection): string {
  return JSON.stringify([item.slug, item.size, item.addOns, item.delivery?.date, item.delivery?.slot, item.cardMessage ?? ""]);
}

function unitPrice(item: CartSelection): number {
  const product = getProduct(item.slug);
  if (!product) return 0;
  const basePrice = product.sizes && item.size ? product.sizes[item.size] : product.price;
  return basePrice + addOns.filter((addOn) => item.addOns.includes(addOn.id) && hasConfirmedPrice(addOn))
    .reduce((sum, addOn) => sum + (addOn.price ?? 0), 0);
}

function totalsAreSafe(count: number, total: number): boolean {
  return Number.isSafeInteger(count) && Number.isFinite(total) && total >= 0 && total <= Number.MAX_SAFE_INTEGER;
}

/** Validate persisted data, discard invalid lines and merge equivalent selections. */
export function normalizeCart(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return [];
  const lines = new Map<string, CartItem>();
  let count = 0;
  let total = 0;
  for (const candidate of value) {
    const item = readItem(candidate);
    if (!item) continue;
    const nextCount = count + item.qty;
    const nextTotal = total + unitPrice(item) * item.qty;
    // Individually valid quantities must also produce reliable combined counts and amounts.
    if (!totalsAreSafe(nextCount, nextTotal)) continue;
    const key = cartLineKey(item);
    const existing = lines.get(key);
    const qty = (existing?.qty ?? 0) + item.qty;
    lines.set(key, { ...item, qty });
    count = nextCount;
    total = nextTotal;
  }
  return [...lines.values()];
}

/** Add a quantity atomically, keeping each delivery and card message distinct. */
export function addCartItem(items: CartItem[], selection: CartSelection, quantity = 1): CartItem[] {
  const item = readItem({ ...selection, qty: quantity });
  if (!item) return items;
  const count = items.reduce((sum, line) => sum + line.qty, quantity);
  const total = items.reduce((sum, line) => sum + unitPrice(line) * line.qty, unitPrice(item) * quantity);
  if (!totalsAreSafe(count, total)) return items;
  const key = cartLineKey(item);
  const existing = items.find((line) => cartLineKey(line) === key);
  if (!existing) return [...items, item];
  if (!Number.isSafeInteger(existing.qty + quantity)) return items;
  return items.map((line) => (line === existing ? { ...line, qty: line.qty + quantity } : line));
}

/** Set one line's quantity; 0 removes it. Totals must stay safe, as with additions. */
export function setCartItemQty(items: CartItem[], key: string, qty: number): CartItem[] {
  if (!Number.isSafeInteger(qty) || qty < 0) return items;
  const next = qty === 0
    ? items.filter((line) => cartLineKey(line) !== key)
    : items.map((line) => (cartLineKey(line) === key ? { ...line, qty } : line));
  const count = next.reduce((sum, line) => sum + line.qty, 0);
  const total = next.reduce((sum, line) => sum + unitPrice(line) * line.qty, 0);
  return totalsAreSafe(count, total) ? next : items;
}

/** Names and amounts always come from the current catalogue, never persisted prices. */
export function cartOrderLines(items: CartItem[]): OrderLine[] {
  return normalizeCart(items).flatMap((item) => {
    const product = getProduct(item.slug);
    if (!product) return [];
    const selectedAddOns = addOns.filter((addOn) => item.addOns.includes(addOn.id));
    const hasUnpricedAddOns = selectedAddOns.some((addOn) => !hasConfirmedPrice(addOn));
    return [{
      name: product.name,
      size: item.size,
      qty: item.qty,
      unitPrice: unitPrice(item),
      addOns: selectedAddOns.map((addOn) => ({ id: addOn.id, name: addOn.name, priced: hasConfirmedPrice(addOn) })),
      ...(hasUnpricedAddOns ? { hasUnpricedAddOns: true } : {}),
      ...(item.delivery ? { delivery: item.delivery } : {}),
      ...(item.cardMessage ? { cardMessage: item.cardMessage } : {}),
    }];
  });
}
