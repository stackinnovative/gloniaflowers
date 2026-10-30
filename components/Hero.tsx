import { preload } from "react-dom";
import Image from "./SiteImage";
import { getHeroImage } from "@/lib/hero-image";
import { getProduct, getProductsIn, type Product } from "@/lib/products";
import { site } from "@/lib/site";
import { customOrderMessage, formatPrice, waLink } from "@/lib/whatsapp";
import { FloralCorner } from "./FloralCorner";
import { LeafIcon } from "./Icons";
import { ShopLink } from "./ShopPause";
import { Sparkles } from "./Sparkles";

const cornerClass = "w-[120px] md:w-[clamp(170px,25vw,390px)]";
const cornerSizes = "(min-width: 768px) clamp(170px, 25vw, 390px), 120px";
const photoSizes = "(min-width: 1080px) 305px, (min-width: 768px) calc((100vw - 160px) / 3), calc(100vw - 104px)";

export function Hero() {
  // Cheapest bouquet for the mobile price badge.
  const bouquet = getProductsIn("korean-bouquets").reduce<Product | null>((min, product) => (!min || product.price < min.price ? product : min), null);

  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden bg-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-3 border border-gold-400 md:inset-7" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-[18px] border border-[#E6D7B2] md:inset-[37px]" />
      {[
        "left-2 top-2 md:left-6 md:top-6",
        "right-2 top-2 md:right-6 md:top-6",
        "left-2 bottom-2 md:left-6 md:bottom-6",
        "right-2 bottom-2 md:right-6 md:bottom-6",
      ].map((position) => (
        <span key={position} aria-hidden="true" className={`pointer-events-none absolute size-2 rotate-45 bg-gold-400 md:size-[9px] ${position}`} />
      ))}
      <FloralCorner corner="tl" src="tl" masked className={cornerClass} sizes={cornerSizes} />
      <FloralCorner corner="tr" src="tl" mirror="x" masked className={cornerClass} sizes={cornerSizes} />
      <FloralCorner corner="bl" src="tl" mirror="y" masked className={cornerClass} sizes={cornerSizes} />
      <FloralCorner corner="br" src="tl" mirror="xy" masked className={cornerClass} sizes={cornerSizes} />
      <Sparkles />

      <div className="relative z-[1] mx-auto flex max-w-[980px] flex-col items-center gap-3.5 px-5 pb-9 pt-[60px] text-center md:gap-[22px] md:px-7 md:pb-[72px] md:pt-[100px]">
        <h1 id="hero-title" className="m-0">
          <Image src="/images/logo.webp" alt={site.name} width={480} height={401} sizes="(min-width: 768px) clamp(240px, 26vw, 360px), 230px" preload fetchPriority="high" className="h-auto w-[230px] md:w-[clamp(240px,26vw,360px)]" />
          {/* The logo is the heading; this gives it a readable name with the location. */}
          <span className="sr-only">, florist in Kozhikode: fresh flowers in Calicut with same day flower delivery</span>
        </h1>
        <div aria-hidden="true" className="flex items-center gap-2.5 text-gold-500 md:gap-3.5">
          <span className="h-px w-11 bg-gold-500 md:w-[70px]" />
          <LeafIcon className="size-3.5 md:size-[18px]" />
          <span className="h-px w-11 bg-gold-500 md:w-[70px]" />
        </div>
        <p className="m-0 max-w-[540px] text-[15px] text-muted md:text-[18px]">{site.heroText}</p>
        <div className="flex w-full flex-col justify-center gap-2.5 pt-1.5 font-caps text-[12px] font-semibold uppercase tracking-[0.16em] md:w-auto md:flex-row md:flex-wrap md:gap-3.5 md:text-[13px]">
          <ShopLink href="/catalog" prefetch={false} pausedLabel={site.shopPause.buttonLabel} className="inline-flex min-h-11 items-center justify-center bg-ink p-4 text-white hover:text-gold-200 md:px-[34px] md:py-[17px]">
            Shop the collection
          </ShopLink>
          <a href={waLink(customOrderMessage)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center border border-gold-500 bg-white p-[15px] text-ink hover:text-gold-text md:px-[34px] md:py-4">
            Custom order
          </a>
        </div>
      </div>

      <div className="relative z-[1] mx-auto grid max-w-[1080px] grid-cols-1 items-end gap-7 px-11 pb-8 md:grid-cols-3 md:px-7 md:pb-7">
        {site.featured.hero.map((slug, index) => {
          const product = getProduct(slug);
          if (!product) return null;
          // The middle photo is the centrepiece and the only one shown on mobile.
          const centerpiece = index === 1;
          const localPhoto = centerpiece ? getHeroImage(product.image) : null;
          // Start the largest-element download with the page head, not when the browser reaches the image.
          if (localPhoto) preload(localPhoto.src, { as: "image", fetchPriority: "high", imageSrcSet: localPhoto.srcSet, imageSizes: photoSizes });
          const photo = <Image src={localPhoto?.src ?? product.image} alt={product.name} fill loading={centerpiece ? "eager" : "lazy"} fetchPriority={centerpiece ? "high" : undefined} sizes={photoSizes} style={{ objectPosition: product.imageFocus }} className="object-cover" />;
          return (
            <div key={slug} className={`${centerpiece ? "" : "hidden md:block"} rounded-t-[999px] rounded-b-[4px] border border-gold-400 bg-white p-[7px] md:p-2`}>
              <div className={`gl-zoom relative overflow-hidden rounded-t-[999px] rounded-b-[2px] ${centerpiece ? "aspect-[4/5] md:aspect-[3/4.4]" : "aspect-[3/4]"}`}>
                {localPhoto ? <picture><source type="image/webp" srcSet={localPhoto.srcSet} sizes={photoSizes} />{photo}</picture> : photo}
              </div>
            </div>
          );
        })}
        {bouquet && (
          <div className="absolute bottom-3 left-5 flex items-center gap-2.5 border border-gold-400 bg-white px-3.5 py-2.5 md:hidden">
            <Image src={bouquet.image} alt="" width={40} height={40} style={{ objectPosition: bouquet.imageFocus }} className="size-10 object-cover" />
            <div>
              <p className="m-0 font-caps text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">Bouquets</p>
              <p className="m-0 font-display text-[17px] leading-[1.1]">from {formatPrice(bouquet.price)}</p>
            </div>
          </div>
        )}
      </div>
      <p className="relative z-[1] mx-auto mb-0 mt-0 max-w-[16rem] px-6 pb-16 text-center text-[13px] italic text-gold-text md:max-w-none md:pb-[96px] md:text-[15px]">
        We use fresh flowers in all our floral arrangements
      </p>
    </section>
  );
}
