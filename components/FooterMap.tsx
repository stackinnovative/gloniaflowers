import { site } from "@/lib/site";
import { PinIcon } from "./Icons";

/** Footer map preview. The whole preview links to Google Maps directions to the shop. */
export function FooterMap() {
  const query = site.mapQuery;
  if (!query) return null;

  const encoded = encodeURIComponent(query);
  // Keyless embed; Maps' directions link opens the app on phones.
  const embedSrc = `https://maps.google.com/maps?q=${encoded}&z=16&output=embed`;
  const directionsHref = `https://www.google.com/maps/dir/?api=1&destination=${encoded}`;

  return (
    <section
      aria-labelledby="footer-map-heading"
      className="relative mx-auto max-w-[1180px] px-[18px] pt-3 sm:px-7 sm:pt-[18px]"
    >
      <h2 id="footer-map-heading" className="sr-only">Find us</h2>
      <div className="border border-line border-t-[3px] border-t-gold-400 bg-white p-2 sm:p-2.5">
        <div className="relative h-[220px] overflow-hidden bg-champagne sm:h-[300px]">
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
            className="group absolute inset-0 flex items-end justify-center p-3 sm:justify-start sm:p-4"
          >
            <span className="inline-flex min-h-11 items-center gap-2 bg-ink px-4 py-3 font-caps text-[11px] font-semibold uppercase tracking-[0.14em] text-white shadow-[0_10px_24px_rgba(26,26,26,0.22)] group-hover:text-gold-200 sm:px-5 sm:text-[12px]">
              <PinIcon size={16} stroke="#E6CF93" className="shrink-0" />
              Get directions
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
