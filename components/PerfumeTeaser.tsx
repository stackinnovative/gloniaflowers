import Image from "next/image";
import { perfumeNotifyMessage, waLink } from "@/lib/whatsapp";
import { WhatsAppIcon } from "./Icons";
import "./PerfumeTeaser.css";

const petals = ["one", "two", "three", "four", "five"];

function PerfumeStage() {
  return (
    <div className="gl-perfume-art">
      <div className="gl-perfume-frame">
        <div className="gl-perfume-stage">
          <Image
            src="/images/perfume-bottle.webp"
            alt="GLONIA perfume bottle in pink glass with a rose-gold cap"
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
        <span className="gl-perfume-launch-label">Launching soon</span>
      </div>
    </div>
  );
}

export function PerfumeTeaser() {
  return (
    <section id="perfumes" aria-labelledby="perfume-heading" className="gl-perfume-section">
      {petals.map((petal) => (
        <span key={petal} aria-hidden="true" className={`gl-float gl-perfume-petal gl-perfume-petal-${petal}`} />
      ))}
      <div className="gl-perfume-inner">
        <div className="gl-perfume-intro">
          <span className="gl-perfume-badge">
            <span aria-hidden="true" className="gl-perfume-badge-dot" />
            Coming soon
          </span>
          <p className="gl-perfume-eyebrow">Something new is blooming</p>
          <h2 id="perfume-heading" className="gl-perfume-heading">
            <span className="gl-perfume-brand">GLONIA</span>
            <span className="gl-shine gl-perfume-script">Perfumes</span>
          </h2>
          <p className="gl-perfume-description">
            <span className="gl-perfume-copy-mobile">Signature fragrances to pair with your flowers. Launching soon — be the first to know.</span>
            <span className="gl-perfume-copy-desktop">Signature fragrances to pair with your flowers. Our perfume collection is launching soon — be the first to know.</span>
          </p>
        </div>
        <PerfumeStage />
        <div className="gl-perfume-actions">
          <a
            href={waLink(perfumeNotifyMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="gl-perfume-notify"
          >
            <WhatsAppIcon size={16} stroke="#E6CF93" className="gl-perfume-action-icon" />
            Notify me on WhatsApp
          </a>
          <p className="gl-perfume-note">We&apos;ll message you on launch day.</p>
        </div>
      </div>
    </section>
  );
}
