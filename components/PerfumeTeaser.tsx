import Image from "next/image";
import { site } from "@/lib/site";
import { waLink } from "@/lib/whatsapp";
import { WhatsAppIcon } from "./Icons";
import "./PerfumeTeaser.css";

const petals = ["one", "two", "three", "four", "five"];
const { perfumes } = site;

function PerfumeStage() {
  return (
    <div className="gl-perfume-art">
      <div className="gl-perfume-frame">
        <div className="gl-perfume-stage">
          {/* Without a photo in Site settings, the default bottle is shown. */}
          <Image
            src={perfumes.image ?? "/images/perfume-bottle.webp"}
            alt={perfumes.image ? `GLONIA ${perfumes.title}` : "GLONIA perfume bottle in pink glass with a rose-gold cap"}
            width={560}
            height={930}
            sizes="(min-width: 1024px) 171px, 96px"
            className="gl-perfume-bottle"
          />
          {["one", "two", "three"].map((sparkle) => (
            <svg
              key={sparkle}
              viewBox="0 0 16 16"
              aria-hidden="true"
              focusable="false"
              className={`gl-tw gl-perfume-sparkle gl-perfume-sparkle-${sparkle}`}
            >
              <path d="M8 0L9.6 6.4L16 8L9.6 9.6L8 16L6.4 9.6L0 8L6.4 6.4Z" fill="currentColor" />
            </svg>
          ))}
        </div>
        {perfumes.imageLabel && <span className="gl-perfume-launch-label">{perfumes.imageLabel}</span>}
      </div>
    </div>
  );
}

/** Home page section; hidden (with its nav links) when Site settings → Perfumes → Show is off. */
export function PerfumeTeaser() {
  if (!perfumes.show) return null;

  return (
    <section id="perfumes" aria-labelledby="perfume-heading" className="gl-perfume-section">
      {petals.map((petal) => (
        <span key={petal} aria-hidden="true" className={`gl-float gl-perfume-petal gl-perfume-petal-${petal}`} />
      ))}
      <div className="gl-perfume-inner">
        <div className="gl-perfume-intro">
          {perfumes.badge && (
            <span className="gl-perfume-badge">
              <span aria-hidden="true" className="gl-perfume-badge-dot" />
              {perfumes.badge}
            </span>
          )}
          {perfumes.eyebrow && <p className="gl-perfume-eyebrow">{perfumes.eyebrow}</p>}
          <h2 id="perfume-heading" className="gl-perfume-heading">
            <span className="gl-perfume-brand">GLONIA</span>
            <span className="gl-shine gl-perfume-script">{perfumes.title}</span>
          </h2>
          <p className="gl-perfume-description">{perfumes.text}</p>
        </div>
        <PerfumeStage />
        <div className="gl-perfume-actions">
          <a
            href={waLink(perfumes.whatsappMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="gl-perfume-notify"
          >
            <WhatsAppIcon size={16} stroke="#E6CF93" className="gl-perfume-action-icon" />
            {perfumes.buttonLabel}
          </a>
          {perfumes.note && <p className="gl-perfume-note">{perfumes.note}</p>}
        </div>
      </div>
    </section>
  );
}
