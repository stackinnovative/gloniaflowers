import Image from "next/image";
import { getProduct } from "@/lib/products";
import { site } from "@/lib/site";
import { customOrderMessage, waLink } from "@/lib/whatsapp";
import { WhatsAppIcon } from "./Icons";
import "./CustomOrderCard.css";

export function CustomOrderCard() {
  return (
    <a href={waLink(customOrderMessage)} target="_blank" rel="noopener noreferrer" className="gl-custom-order-card">
      <span className="gl-custom-order-label">Made just for you</span>
      <span aria-hidden="true" className="gl-float gl-custom-order-petal gl-custom-order-petal-one" />
      <span aria-hidden="true" className="gl-float gl-custom-order-petal gl-custom-order-petal-two" />
      <span aria-hidden="true" className="gl-float gl-custom-order-petal gl-custom-order-petal-three" />
      <div aria-hidden="true" className="gl-custom-order-photos">
        {site.featured.customOrder.map((slug, index) => {
          const product = getProduct(slug);
          return product ? (
            <Image key={slug} src={product.image} alt="" width={80} height={80} className={`gl-custom-order-photo gl-custom-order-photo-${index + 1}`} />
          ) : null;
        })}
        <span className="gl-custom-order-plus">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor"><path d="M8 2v12M2 8h12" /></svg>
        </span>
      </div>
      <p className="gl-custom-order-accent">Custom order</p>
      <h3 className="gl-custom-order-heading">
        Can&apos;t find it?<br />
        <span className="gl-shine">We&apos;ll make it.</span>
      </h3>
      <div className="gl-custom-order-chips">
        <span>Your colours</span>
        <span>Your budget</span>
        <span>Your date</span>
      </div>
      <span className="gl-custom-order-cta"><WhatsAppIcon size={15} stroke="#E6CF93" />Design yours on WhatsApp</span>
      <span className="gl-custom-order-hours">Quick replies · {site.hours.label}</span>
    </a>
  );
}
