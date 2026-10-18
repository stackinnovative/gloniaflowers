import { site } from "@/lib/site";
import { DirectionsIcon } from "./Icons";

/** Map preview that fills its footer card. The whole preview links to Google Maps directions. */
export function FooterMap({ query }: { query: string }) {
  const encoded = encodeURIComponent(query);
  // Keyless embed; Maps' directions link opens the app on phones.
  const embedSrc = `https://maps.google.com/maps?q=${encoded}&z=15&output=embed`;
  const directionsHref = `https://www.google.com/maps/dir/?api=1&destination=${encoded}`;

  return (
    <div className="relative mt-1 min-h-[180px] flex-1 overflow-hidden border border-line bg-champagne">
      {/* Preview only: the link on top takes every click, so the map itself isn't interactive. */}
      <iframe
        src={embedSrc}
        title={`Map showing ${site.name}`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        tabIndex={-1}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 size-full border-0"
      />
      <a
        href={directionsHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Get directions to ${site.name} on Google Maps (opens in a new tab)`}
        className="group absolute inset-0 flex items-end justify-center p-2.5"
      >
        <span className="inline-flex min-h-10 items-center gap-2 bg-ink px-3.5 py-2.5 font-caps text-[11px] font-semibold uppercase tracking-[0.14em] text-white shadow-[0_8px_20px_rgba(26,26,26,0.22)] group-hover:text-gold-200">
          <DirectionsIcon size={15} stroke="#E6CF93" className="shrink-0" />
          Get directions
        </span>
      </a>
    </div>
  );
}
