import { site } from "./site";

const hourFormat = new Intl.DateTimeFormat("en-GB", {
  hour: "numeric",
  hourCycle: "h23",
  timeZone: site.timeZone,
});

/** Current hour (0–23) in India time. */
function hourInShopTime(now: Date): number {
  const part = hourFormat.formatToParts(now).find((p) => p.type === "hour");
  return Number(part?.value ?? 0);
}

export function isOpenNow(now: Date = new Date()): boolean {
  const hour = hourInShopTime(now);
  return hour >= site.hours.open && hour < site.hours.close;
}
