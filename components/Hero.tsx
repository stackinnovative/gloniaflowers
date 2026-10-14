import Image from "next/image";
import Link from "next/link";
import { getProduct, getProductsIn } from "@/lib/products";
import { site } from "@/lib/site";
import { customOrderMessage, formatPrice, waLink } from "@/lib/whatsapp";
import { FloralCorner } from "./FloralCorner";
import { LeafIcon } from "./Icons";
import { Sparkles } from "./Sparkles";

const photos = [
  { slug: "single-red-rose", alt: "Single red rose bouquet in black wrap", centerpiece: false },
  { slug: "peach-white-blooming-box", alt: "Peach and white roses in a black blooming box", centerpiece: true },
  { slug: "white-hydrangea-box", alt: "White hydrangea in a black box", centerpiece: false },
];

const cornerClass = "w-[120px] md:w-[clamp(170px,25vw,390px)]";

export function Hero() {
  const bouquetPrice = Math.min(...getProductsIn("korean").map((product) => product.price));

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
      <FloralCorner corner="tl" src="tl" masked className={cornerClass} />
      <FloralCorner corner="tr" src="tl" mirror="x" masked className={cornerClass} />
      <FloralCorner corner="bl" src="tl" mirror="y" masked className={cornerClass} />
      <FloralCorner corner="br" src="tl" mirror="xy" masked className={cornerClass} />
      <Sparkles />

      <div className="relative z-[1] mx-auto flex max-w-[980px] flex-col items-center gap-3.5 px-5 pb-9 pt-[60px] text-center md:gap-[22px] md:px-7 md:pb-[72px] md:pt-[100px]">
        <h1 id="hero-title" className="m-0">
          <Image src="/images/logo.png" alt={site.name} width={515} height={430} preload fetchPriority="high" className="h-auto w-[230px] md:w-[clamp(240px,26vw,360px)]" />
        </h1>
        <div aria-hidden="true" className="flex items-center gap-2.5 text-gold-500 md:gap-3.5">
          <span className="h-px w-11 bg-gold-500 md:w-[70px]" />
          <LeafIcon className="size-3.5 md:size-[18px]" />
          <span className="h-px w-11 bg-gold-500 md:w-[70px]" />
        </div>
        <p className="m-0 max-w-[540px] text-[15px] text-muted md:text-[18px]">
          <span className="md:hidden">Korean bouquets, flower boxes and bridal décor, hand-made and delivered fresh.</span>
          <span className="hidden md:inline">Korean bouquets, flower boxes and bridal décor — hand-made in our studio and delivered fresh to your door.</span>
        </p>
        <div className="flex w-full flex-col justify-center gap-2.5 pt-1.5 font-caps text-[12px] font-semibold uppercase tracking-[0.16em] md:w-auto md:flex-row md:flex-wrap md:gap-3.5 md:text-[13px]">
          <Link href="/catalog" prefetch={false} className="inline-flex min-h-11 items-center justify-center bg-ink p-4 text-white hover:text-gold-200 md:px-[34px] md:py-[17px]">
            Shop the collection
          </Link>
          <a href={waLink(customOrderMessage)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center border border-gold-500 bg-white p-[15px] text-ink hover:text-gold-text md:px-[34px] md:py-4">
            Custom order
          </a>
        </div>
      </div>

      <div className="relative z-[1] mx-auto grid max-w-[1080px] grid-cols-1 items-end gap-7 px-11 pb-16 md:grid-cols-3 md:px-7 md:pb-[110px]">
        {photos.map((photo) => {
          const product = getProduct(photo.slug);
          if (!product) return null;
          return (
            <div key={photo.slug} className={`${photo.centerpiece ? "" : "hidden md:block"} rounded-t-[999px] rounded-b-[4px] border border-gold-400 bg-white p-[7px] md:p-2`}>
              <div className={`gl-zoom relative overflow-hidden rounded-t-[999px] rounded-b-[2px] ${photo.centerpiece ? "aspect-[4/5] md:aspect-[3/4.4]" : "aspect-[3/4]"}`}>
                <Image src={product.image} alt={photo.alt} fill sizes="(min-width: 1080px) 305px, (min-width: 768px) 30vw, 75vw" className="object-cover" />
              </div>
            </div>
          );
        })}
        <div className="absolute bottom-11 left-5 flex items-center gap-2.5 border border-gold-400 bg-white px-3.5 py-2.5 md:hidden">
          <Image src="/images/products/single-red-rose.jpg" alt="" width={40} height={40} className="size-10 object-cover" />
          <div>
            <p className="m-0 font-caps text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">Bouquets</p>
            <p className="m-0 font-display text-[17px] leading-[1.1]">from {formatPrice(bouquetPrice)}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
