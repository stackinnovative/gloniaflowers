import Image from "next/image";
import { SIZE_INCHES, SIZE_NAMES, type Product, type SizeKey } from "@/lib/products";

export function ProductPhoto({ product, size }: { product: Product; size: SizeKey | null }) {
  return (
    <div className="gl-detail-visual">
      <div className="gl-detail-stage">
        <div className="gl-detail-photo-frame">
          <div className="gl-detail-photo gl-zoom">
            <Image src={product.image} alt={product.name} fill priority fetchPriority="high" sizes="(min-width: 1320px) 533px, (min-width: 1024px) 42vw, (min-width: 600px) 548px, 80vw" className="object-cover" />
          </div>
          <span className="gl-detail-fresh"><span aria-hidden="true" />Fresh on delivery day</span>
          {size && (
            <>
              <span className="gl-detail-sizes-badge"><span>S · M · L</span><small>3 sizes</small></span>
              <div className="gl-detail-size-card">
                <span className="gl-detail-ruler" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor"><path d="M2 11.5L11.5 2 14 4.5 4.5 14zM5 9.5l1 1M7 7.5l1.5 1.5M9 5.5l1 1" /></svg>
                </span>
                <span><small>Size {SIZE_NAMES[size]}</small><strong>{SIZE_INCHES[size]} box</strong></span>
              </div>
            </>
          )}
        </div>
      </div>
      <ul className="gl-detail-trust" aria-label="Flower and delivery details" role="list">
        <li><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true"><path d="M8 14V7M8 7C8 4 6 2 3 2c0 3 2 5 5 5zM8 9c0-3 2-5 5-5 0 3-2 5-5 5z" /></svg>Fresh flowers daily</li>
        <li><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true"><path d="M1.5 4h8v7h-8zM9.5 6.5h3l2 2.5v2h-5" /><circle cx="4.5" cy="12" r="1.3" /><circle cx="12" cy="12" r="1.3" /></svg>Same-day delivery</li>
        <li><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true"><rect x="2" y="3.5" width="12" height="9" rx="1" /><path d="M2 4l6 5 6-5" /></svg>Free message card</li>
      </ul>
    </div>
  );
}
