import { site } from "./site";

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

/** Refresh after midnight, when returning to the tab, or when the window gains focus. */
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
