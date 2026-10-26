import { minutesInShopTime } from "./hours";
import { deliverySlots, site, type DeliverySlot } from "./site";

const indiaDate = new Intl.DateTimeFormat("en-CA", {
  timeZone: site.timeZone,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Calendar date at the shop, independent of the customer's timezone. */
export function todayInIndia(now: Date = new Date()): string {
  const parts = indiaDate.formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((value) => value.type === type)?.value ?? "";
  return `${part("year").padStart(4, "0")}-${part("month")}-${part("day")}`;
}

/** Refresh every minute (slots close and the date changes), when returning to the tab, or when the window gains focus. */
export function subscribeIndiaDate(listener: () => void): () => void {
  const timer = window.setInterval(listener, 60_000);
  window.addEventListener("focus", listener);
  document.addEventListener("visibilitychange", listener);
  return () => {
    window.clearInterval(timer);
    window.removeEventListener("focus", listener);
    document.removeEventListener("visibilitychange", listener);
  };
}

function isCalendarDate(date: string): boolean {
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date) || date.startsWith("0000-")) return false;
  const value = new Date(`${date}T00:00:00.000Z`);
  return Number.isFinite(value.getTime()) && value.toISOString().slice(0, 10) === date;
}

/** Check a real ISO calendar date, optionally on or after a minimum date. */
export function isValidDeliveryDate(date: string, min?: string): boolean {
  return isCalendarDate(date) && (min === undefined || (isCalendarDate(min) && date >= min));
}

/** The current minute, for useSyncExternalStore with subscribeIndiaDate. */
export function currentMinute(): number {
  return Math.floor(Date.now() / 60_000);
}

/**
 * When a slot starts, in minutes after midnight, read from its label: "9–10 AM" → 540,
 * "11 AM–12 PM" → 660, "12–1 PM" → 720. Null if the label can't be read.
 * scripts/sync-sanity.mjs and the Studio check labels with the same pattern.
 */
export function slotStart(slot: string): number | null {
  const match = /^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?\s*[–-]\s*(\d{1,2})(?::\d{2})?\s*(AM|PM)$/i.exec(slot.trim());
  if (!match) return null;
  const [, startHour, startMinute = "0", startPeriod, endHour, endPeriod] = match;
  const hour = Number(startHour) % 12;
  // Without its own AM/PM the start shares the end's, unless it would then come after the end ("11–12 PM" starts at 11 AM).
  const endIsPm = endPeriod.toUpperCase() === "PM";
  const pm = startPeriod ? startPeriod.toUpperCase() === "PM" : hour <= Number(endHour) % 12 ? endIsPm : !endIsPm;
  return (hour + (pm ? 12 : 0)) * 60 + Number(startMinute);
}

function nextDay(date: string): string {
  const value = new Date(`${date}T00:00:00.000Z`);
  value.setUTCDate(value.getUTCDate() + 1);
  return value.toISOString().slice(0, 10);
}

/**
 * Slots a customer can still choose for a date: every slot on later days; today, only slots that start
 * after the current hour plus the preparation time (Site settings). At 10:15 with 1 hour: from 12 PM.
 */
export function availableSlots(date: string, now: Date = new Date()): DeliverySlot[] {
  const today = todayInIndia(now);
  if (!isValidDeliveryDate(date, today)) return [];
  if (date !== today) return [...deliverySlots];
  const earliest = (Math.floor(minutesInShopTime(now) / 60) + 1 + site.sameDayLeadHours) * 60;
  return deliverySlots.filter((slot) => (slotStart(slot) ?? 0) >= earliest);
}

/** Today, or tomorrow once today has no slots left. */
export function firstDeliveryDate(now: Date = new Date()): string {
  const today = todayInIndia(now);
  return availableSlots(today, now).length ? today : nextDay(today);
}

/** True when a chosen delivery can no longer be ordered: its date has passed, or today's slot is too soon. */
export function isDeliveryClosed(delivery: { date: string; slot?: DeliverySlot }, now: Date = new Date()): boolean {
  if (delivery.slot === undefined) return !isValidDeliveryDate(delivery.date, todayInIndia(now));
  return !availableSlots(delivery.date, now).includes(delivery.slot);
}
