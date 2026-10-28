import Image from "next/image";
import { getProduct, SIZE_KEYS, SIZE_NAMES, sizeNamesList, type SizeKey } from "@/lib/products";
import { site } from "@/lib/site";

// Circle diameters (mobile / desktop), scaled to the box size so all four fit on one row at 390px.
const CIRCLES: Record<SizeKey, { className: string; sizes: string }> = {
  S: { className: "w-[60px] min-[861px]:w-[96px]", sizes: "(min-width: 861px) 84px, 52px" },
  M: { className: "w-[68px] min-[861px]:w-[112px]", sizes: "(min-width: 861px) 100px, 60px" },
  L: { className: "w-[78px] min-[861px]:w-[128px]", sizes: "(min-width: 861px) 116px, 70px" },
  XL: { className: "w-[94px] min-[861px]:w-[154px]", sizes: "(min-width: 861px) 142px, 86px" },
};

export function SizeReference() {
  const product = getProduct(site.featured.sizeReference);
  if (!product) return null;
  // The square photo from Site settings; without one, the product's own photo (which may need cropping in the Studio).
  const photo = site.sizeReferenceImage.image
    ? { src: site.sizeReferenceImage.image, focus: site.sizeReferenceImage.imageFocus }
    : { src: product.image, focus: product.imageFocus };

  return (
    <section id="size-reference" aria-labelledby="size-reference-heading" className="mx-auto max-w-site px-4 pt-[60px] min-[861px]:px-7 min-[861px]:pt-[120px]">
      <div className="relative flex flex-col items-center gap-3.5 bg-champagne px-5 py-9 text-center min-[861px]:flex-row min-[861px]:flex-wrap min-[861px]:gap-12 min-[861px]:p-[clamp(36px,5vw,76px)] min-[861px]:text-left">
        <div aria-hidden="true" className="pointer-events-none absolute inset-2 border border-gold-400 min-[861px]:inset-3.5" />
        <div className="relative flex min-w-0 flex-col gap-3.5 min-[861px]:flex-[1_1_360px] min-[861px]:gap-4">
          <p className="m-0 font-script text-[28px] leading-none text-gold-text min-[861px]:text-[34px]">Box size reference</p>
          <h2 id="size-reference-heading" className="m-0 font-display text-[30px] font-normal leading-[1.08] min-[861px]:text-[clamp(36px,4.4vw,56px)] min-[861px]:leading-[1.04]">
            One design. <span className="italic">Four sizes.</span>
          </h2>
          <p className="m-0 hidden max-w-[420px] text-[17px] text-muted min-[861px]:block">
            Boxes come in {sizeNamesList(SIZE_KEYS)}. Pick the size that fits the moment.
          </p>
        </div>

        <ul role="list" aria-label="Box sizes in inches" className="relative m-0 flex list-none items-end justify-center gap-1.5 p-0 pt-2 min-[861px]:flex-[1.4_1_480px] min-[861px]:flex-wrap min-[861px]:gap-[clamp(10px,1.6vw,24px)] min-[861px]:pt-0">
          {SIZE_KEYS.map((size) => (
            <li key={size} className="flex flex-col items-center gap-2 min-[861px]:gap-3.5">
              <div className={`${CIRCLES[size].className} aspect-square rounded-full border border-gold-400 bg-white p-1 min-[861px]:p-1.5`}>
                <div className="relative size-full overflow-hidden rounded-full">
                  <Image src={photo.src} alt={`${SIZE_NAMES[size]} box`} fill sizes={CIRCLES[size].sizes} style={{ objectPosition: photo.focus }} className="object-cover" />
                </div>
              </div>
              <div className={`${CIRCLES[size].className} flex items-center gap-[3px] text-gold-text min-[861px]:gap-1.5`}>
                <span aria-hidden="true" className="h-[9px] w-px shrink-0 bg-gold-500 min-[861px]:h-3" />
                <span aria-hidden="true" className="h-px flex-1 bg-gold-500" />
                <span className="whitespace-nowrap text-[10px] font-bold min-[861px]:text-[14px]">{site.boxSizes[size]} inch</span>
                <span aria-hidden="true" className="h-px flex-1 bg-gold-500" />
                <span aria-hidden="true" className="h-[9px] w-px shrink-0 bg-gold-500 min-[861px]:h-3" />
              </div>
              <p className="m-0 whitespace-nowrap font-display text-[15px] leading-none min-[861px]:text-[24px]">{SIZE_NAMES[size]}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
