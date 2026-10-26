import { site } from "./site";

/** True while online ordering is paused (Site settings → Pause shop), within its optional start and end. */
export function isShopPaused(now: Date = new Date()): boolean {
  const { enabled, start, end } = site.shopPause;
  if (!enabled) return false;
  const time = now.getTime();
  return (!start || time >= Date.parse(start)) && (!end || time < Date.parse(end));
}
