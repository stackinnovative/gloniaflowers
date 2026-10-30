import Image from "./SiteImage";
import Link from "next/link";
import { site } from "@/lib/site";
import { waLink } from "@/lib/whatsapp";
import { FloralCorner } from "./FloralCorner";
import { FooterMap } from "./FooterMap";
import { CartIcon, DirectionsIcon, InstagramIcon, PhoneIcon, PinIcon, WhatsAppIcon } from "./Icons";
import { ShopLink } from "./ShopPause";

const cardClass =
  "flex min-w-0 flex-col gap-1.5 border border-line border-t-[3px] border-t-gold-400 bg-white p-[18px] text-left text-[15px] text-[#4A443D] [overflow-wrap:anywhere] sm:gap-2 sm:p-[26px]";

const buttonClass =
  "inline-flex min-h-11 min-w-0 items-center justify-center gap-2 px-3 py-3.5 font-caps text-[11px] font-semibold uppercase tracking-[0.12em] sm:gap-2.5 sm:px-[26px] sm:text-[12px] sm:tracking-[0.16em]";

function CardTitle({ icon, children }: { icon: React.ReactNode; children: string }) {
  return (
    <h2 className="m-0 flex items-center gap-3 pb-1.5 font-caps text-[14px] font-semibold tracking-[0.16em] text-ink">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-gold-400">{icon}</span>
      {children}
    </h2>
  );
}

export function Footer() {
  return (
    <footer id="contact" className="relative overflow-hidden border-t border-[#E6D7B2] bg-champagne-2 text-ink">
      <FloralCorner corner="tl" src="tl" className="w-[120px] sm:w-[clamp(140px,19vw,270px)]" sizes="(min-width: 640px) clamp(140px, 19vw, 270px), 120px" />
      <FloralCorner corner="br" src="br" className="w-[130px] sm:w-[clamp(140px,19vw,270px)]" sizes="(min-width: 640px) clamp(140px, 19vw, 270px), 130px" />

      <div className="relative mx-auto flex max-w-[1180px] flex-col items-center gap-3.5 px-[18px] pt-12 text-center sm:gap-4 sm:px-7 sm:pt-[76px]">
        <Image
          src="/images/logo.webp"
          alt={site.name}
          width={515}
          height={430}
          sizes="(min-width: 640px) 170px, 130px"
          className="h-auto w-[130px] mix-blend-multiply sm:w-[170px]"
        />
        <p className="gl-shine m-0 px-[0.2em] font-display text-[32px] italic leading-[1.2] sm:text-[42px]">{site.tagline}</p>
        <div className="grid w-full grid-cols-2 gap-2 pt-1 sm:flex sm:w-auto sm:flex-wrap sm:justify-center sm:gap-3">
          <a
            href={waLink()}
            target="_blank"
            rel="noopener noreferrer"
            className={`${buttonClass} bg-ink text-white hover:text-gold-200`}
          >
            <WhatsAppIcon size={16} stroke="#E6CF93" className="shrink-0" />
            <span>
              <span className="hidden sm:inline">Order on </span>WhatsApp
            </span>
          </a>
          <a
            href={site.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`${buttonClass} border border-gold-400 bg-white text-ink`}
          >
            <InstagramIcon size={16} stroke="#8A6A26" className="shrink-0" />
            <span>
              <span className="hidden sm:inline">Follow on </span>Instagram
            </span>
          </a>
        </div>
      </div>

      <div
        className={`relative mx-auto grid max-w-[1180px] grid-cols-1 gap-3 px-[18px] pt-8 sm:gap-[18px] sm:px-7 sm:pt-[52px] ${
          // With the map: four in a row on wide screens, 2 × 2 on tablets.
          site.mapQuery ? "sm:grid-cols-2 xl:grid-cols-4" : "sm:grid-cols-[repeat(auto-fit,minmax(250px,1fr))]"
        }`}
      >
        <div className={cardClass}>
          <CardTitle icon={<PhoneIcon size={17} stroke="#8A6A26" />}>CONTACT</CardTitle>
          <a href={waLink()} target="_blank" rel="noopener noreferrer">
            WhatsApp {site.phoneDisplay}
          </a>
          <a href={`tel:${site.phoneTel}`}>Call {site.phoneDisplay}</a>
          <a href={`mailto:${site.email}`}>{site.email}</a>
        </div>
        <div className={cardClass}>
          <CardTitle icon={<PinIcon size={17} stroke="#8A6A26" />}>VISIT</CardTitle>
          <address className="not-italic">
            {site.address.street}
            <br />
            {site.address.city}
          </address>
          <p className="m-0">Open every day · {site.hours.label}</p>
        </div>
        <div className={cardClass}>
          <CardTitle icon={<CartIcon size={17} stroke="#8A6A26" />}>SHOP</CardTitle>
          <ShopLink href="/catalog?c=korean-bouquets">Korean Bouquets</ShopLink>
          <ShopLink href="/catalog?c=classic-boxes">Classic Boxes</ShopLink>
          <ShopLink href="/catalog?c=blooming-boxes">Blooming Boxes</ShopLink>
          <Link href="/#work">Bridal &amp; Car Décor</Link>
        </div>
        {site.mapQuery && (
          <div className={cardClass}>
            <CardTitle icon={<DirectionsIcon size={16} stroke="#8A6A26" />}>FIND US</CardTitle>
            <FooterMap query={site.mapQuery} destination={site.googleListing || site.mapQuery} />
          </div>
        )}
      </div>

      <div className="relative mx-auto mt-8 flex max-w-[1180px] flex-col gap-1 border-t border-[#E1D3B4] px-[18px] pb-[110px] pt-[22px] text-center text-[12px] text-muted sm:mt-[52px] sm:pb-7 sm:flex-row sm:flex-wrap sm:justify-between sm:gap-2.5 sm:px-7 sm:text-left sm:text-[13px]">
        <p className="m-0">
          © {new Date().getFullYear()} {site.name}
        </p>
      </div>
    </footer>
  );
}
