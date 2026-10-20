"use client";

import { useSyncExternalStore } from "react";
import { isOpenNow } from "@/lib/hours";
import { site } from "@/lib/site";
import { LeafIcon, MoonIcon } from "./Icons";

// Re-check at minute boundaries and immediately after returning to the page.
function subscribeToClock(onChange: () => void) {
  let timer: number;
  const schedule = () => {
    timer = window.setTimeout(() => {
      onChange();
      schedule();
    }, 60_000 - (Date.now() % 60_000));
  };
  const onVisibilityChange = () => { if (!document.hidden) onChange(); };
  schedule();
  window.addEventListener("focus", onChange);
  document.addEventListener("visibilitychange", onVisibilityChange);
  return () => {
    window.clearTimeout(timer);
    window.removeEventListener("focus", onChange);
    document.removeEventListener("visibilitychange", onVisibilityChange);
  };
}

/** null while rendering at build time — status is only known in the browser. */
function useOpenStatus(): boolean | null {
  return useSyncExternalStore(subscribeToClock, () => isOpenNow(), () => null);
}

function tickerMessages(open: boolean | null): string[] {
  const status =
    open === null
      ? []
      : [open ? "Open now — we reply in minutes" : "Closed now — message us, we reply first thing in the morning"];
  return [
    ...status,
    `Shop hours: ${site.hours.label}, every day`,
    "Ordering late at night? Send it on WhatsApp — we'll get back to you first thing in the morning",
    "Same-day delivery",
    `WhatsApp / Call ${site.phoneDisplay}`,
  ];
}

function StatusPill({ open }: { open: boolean | null }) {
  if (open === null) return <span>{site.hours.label}</span>;
  if (open) {
    return (
      <>
        <span className="block size-2 rounded-full bg-[#7BD49B] shadow-[0_0_0_3px_rgba(123,212,155,0.25)]" />
        <span>
          Open<span className="hidden sm:inline"> now</span>
        </span>
      </>
    );
  }
  return (
    <>
      <MoonIcon size={14} stroke="#D9BE84" />
      <span>
        Closed<span className="hidden sm:inline"> now · replies from {site.hours.opensAt}</span>
      </span>
    </>
  );
}

export function TopBar() {
  const open = useOpenStatus();
  const messages = tickerMessages(open);

  return (
    <div
      role="region"
      aria-label="Shop hours and replies"
      className="flex items-stretch overflow-hidden bg-ink text-[12px] tracking-[0.03em] text-gold-300 sm:text-[13px] sm:tracking-[0.05em]"
    >
      <div role="status" aria-live="polite" aria-atomic="true" className="relative z-[1] flex flex-none items-center gap-1.5 whitespace-nowrap border-r border-[#5A4A2C] bg-[#2A2520] px-2.5 py-2 font-bold text-[#F3EBDD] sm:gap-[9px] sm:px-5 sm:py-2.5">
        <StatusPill open={open} />
      </div>
      <div className="min-w-0 flex-1 overflow-hidden">
        <div className="gl-tick flex w-max items-center py-2 sm:py-2.5">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex" aria-hidden={copy === 1 || undefined}>
              {messages.map((m) => (
                <span key={m} className="inline-flex items-center gap-6 whitespace-nowrap pr-6 sm:gap-9 sm:pr-9">
                  {m}
                  <LeafIcon size={10} fill="#C9A85C" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
