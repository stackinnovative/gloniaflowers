import Image from "next/image";
import { getProduct } from "@/lib/products";
import { site } from "@/lib/site";

export function Gallery() {
  return (
    <section id="gallery" aria-labelledby="gallery-heading" className="flex flex-col gap-4 py-14 min-[861px]:gap-[30px] min-[861px]:py-[110px]">
      <div className="flex flex-col items-center gap-1.5 px-4 text-center min-[861px]:px-7">
        <h2 id="gallery-heading" className="m-0 font-display text-[28px] font-normal italic leading-none text-gold-text min-[861px]:text-[36px]">Fresh from the studio</h2>
        <a href={site.instagram.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center font-display text-[24px] leading-[1.1] min-[861px]:text-[clamp(30px,3.6vw,46px)]">
          {site.instagram.handle}
        </a>
      </div>
      <ul role="list" className="m-0 grid list-none grid-cols-3 gap-1 px-1 min-[861px]:grid-cols-[repeat(auto-fit,minmax(180px,1fr))] min-[861px]:gap-2.5 min-[861px]:px-2.5">
        {site.featured.gallery.map((slug) => {
          const product = getProduct(slug);
          if (!product) return null;
          return (
            <li key={slug} className="gl-zoom relative aspect-square overflow-hidden rounded-[6px] min-[861px]:rounded-[12px]">
              <Image src={product.image} alt={product.name} fill sizes="(min-width: 1200px) 17vw, (min-width: 861px) 25vw, 33vw" className="object-cover" />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
