import Image from "next/image";
import Link from "next/link";
import { getCollection, getCollections, getProductsIn } from "@/lib/products";
import { collectionImages } from "@/lib/site";
import { formatPrice, waLink } from "@/lib/whatsapp";
import { LeafIcon } from "./Icons";
import "./CollectionsBento.css";

const TILE_IDS = ["bloom", "korean", "classic", "red"] as const;
type TileId = (typeof TILE_IDS)[number];

function CollectionTile({ id }: { id: TileId }) {
  const collection = getCollection(id);
  const image = collectionImages[id];
  if (!collection || !image) return null;

  const products = getProductsIn(id);
  const prices = products.flatMap((product) => (product.sizes ? Object.values(product.sizes) : [product.price]));
  const price = prices.length ? formatPrice(Math.min(...prices)) : null;
  const imageProduct = products.find((product) => product.image === image);
  const featured = id === "bloom";

  return (
    <Link
      href={`/catalog?c=${id}`}
      className={`gl-zoom gl-collections-tile ${featured ? "gl-collections-featured" : ""} ${id === "red" ? "gl-collections-mobile-only" : ""}`}
    >
      <Image
        src={image}
        alt={imageProduct?.name ?? collection.name}
        fill
        sizes={featured ? "(min-width: 1320px) 622px, 50vw" : "(min-width: 1320px) 301px, (min-width: 861px) 25vw, 50vw"}
        className="object-cover"
      />
      <div className="gl-collections-tile-label">
        <div>
          <h3 className="gl-collections-tile-title">{collection.name}</h3>
          <p className="gl-collections-tile-price">
            {featured && <span className="gl-collections-featured-description">Full, lush arrangements · </span>}
            {price ? `from ${price}` : "Coming soon"}
          </p>
          {!featured && <span className="gl-collections-compact-price">{price ? ` · ${price}+` : " · Coming soon"}</span>}
        </div>
        {featured && <span className="gl-collections-shop-label font-caps">Shop →</span>}
      </div>
    </Link>
  );
}

function InvitationArt() {
  return (
    <div className="gl-collections-invitation-art" aria-hidden="true">
      <div className="gl-collections-back-card" />
      <div className="gl-collections-front-card">
        <div className="flex h-full flex-col items-center justify-center gap-2 border border-[#E6D7B2] text-center">
          <svg width="34" height="20" viewBox="0 0 34 20" fill="none" focusable="false">
            <path d="M17 18C17 10 11 4 3 3c1 8 7 13 14 15z" fill="#5E7F45" />
            <path d="M17 18c0-8 6-14 14-15-1 8-7 13-14 15z" fill="#1A1A1A" />
          </svg>
          <span className="font-display text-[23px] italic leading-none text-gold-text">Save the date</span>
          <span className="h-px w-11 bg-gold-400" />
          <span className="font-caps text-[10px] font-semibold tracking-[0.22em] text-ink">
            FLOWERS BY<br />GLONIA
          </span>
        </div>
      </div>
      <div className="gl-collections-seal">
        <span className="flex size-[50px] items-center justify-center rounded-full border border-gold-200 font-caps text-2xl font-semibold text-[#FFF6E2]">G</span>
      </div>
    </div>
  );
}

function WeddingInvitation() {
  return (
    <a
      href={waLink("Hi GLONIA, I'd like to plan flowers for a wedding or event.\nEvent date: \nFlowers needed: ")}
      target="_blank"
      rel="noopener noreferrer"
      className="gl-collections-invitation"
    >
      <span className="gl-collections-outer-ring" aria-hidden="true" />
      <span className="gl-collections-inner-ring" aria-hidden="true" />
      <div className="relative z-[1] flex min-w-0 flex-1 flex-col items-start gap-3">
        <p className="m-0 font-caps text-[11px] font-semibold uppercase tracking-[0.26em] text-[#46612F]">Weddings &amp; events</p>
        <h3 className="m-0 font-display text-[32px] font-normal leading-[1.04] min-[861px]:text-[38px]">
          Make your big day <span className="italic text-[#46612F]">bloom</span>
        </h3>
        <div className="flex flex-wrap gap-x-3.5 gap-y-1.5 text-[13px] font-semibold text-[#3B3A33]">
          {["Bridal bouquets", "Car décor", "Event florals"].map((service) => (
            <span key={service} className="inline-flex items-center gap-[7px]">
              <span className="block size-1.5 rotate-45 bg-gold-500" aria-hidden="true" />
              {service}
            </span>
          ))}
        </div>
        <span className="mt-1.5 inline-flex min-h-11 items-center gap-2.5 bg-ink px-[22px] py-[13px] font-caps text-[12px] font-semibold uppercase tracking-[0.16em] text-white">
          Plan with us
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#D9BE84" aria-hidden="true" focusable="false">
            <path d="M3 8h10M9 4l4 4-4 4" />
          </svg>
        </span>
      </div>
      <InvitationArt />
    </a>
  );
}

export function CollectionsBento() {
  const moreCollections = getCollections().filter((collection) => !["bloom", "korean", "classic"].includes(collection.id));

  return (
    <section id="collections" aria-labelledby="collections-title" className="gl-collections-section">
      <div className="flex flex-col items-center gap-1.5 text-center">
        <p className="m-0 font-script text-[30px] leading-none text-gold-text min-[861px]:text-[36px]">Collections</p>
        <h2 id="collections-title" className="gl-collections-heading">
          Find the one <span className="italic">they&apos;ll love</span>
        </h2>
      </div>
      <div className="gl-collections-grid">
        {TILE_IDS.map((id) => <CollectionTile key={id} id={id} />)}
        <WeddingInvitation />
      </div>
      <nav aria-label="More flower collections" className="gl-row gl-collections-chips">
        {moreCollections.map((collection) => (
          <Link
            key={collection.id}
            href={`/catalog?c=${collection.id}`}
            className={`gl-collections-chip ${collection.id === "red" ? "gl-collections-desktop-only" : ""}`}
          >
            <LeafIcon size={12} />
            {collection.name}
          </Link>
        ))}
      </nav>
    </section>
  );
}
