import { site } from "./site";

const timeFormat = new Intl.DateTimeFormat("en-GB", {
  hour: "numeric",
  minute: "numeric",
  hourCycle: "h23",
  timeZone: site.timeZone,
});

/** "08:30" → 510 */
function toMinutes(time: string): number {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

/** Minutes since midnight in India time. */
function minutesInShopTime(now: Date): number {
  const parts = timeFormat.formatToParts(now);
  const part = (type: "hour" | "minute") => Number(parts.find((p) => p.type === type)?.value ?? 0);
  return part("hour") * 60 + part("minute");
}

export function isOpenNow(now: Date = new Date()): boolean {
  const minutes = minutesInShopTime(now);
  return minutes >= toMinutes(site.hours.open) && minutes < toMinutes(site.hours.close);
}
