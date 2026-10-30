import Image from "./SiteImage";
import type { CSSProperties } from "react";
import { site } from "@/lib/site";
import { FloralCorner } from "./FloralCorner";
import { ShopLink } from "./ShopPause";
import "./OurWork.css";

export function OurWork() {
  const { intro, items } = site.ourWork;
  if (!items.length) return null;

  return (
    <section id="work" aria-labelledby="our-work-heading" className="gl-work-section">
      <FloralCorner corner="tr" src="br" mirror="y" className="gl-work-floral" />
      <div className="gl-work-content">
        <div className="gl-work-heading">
          <p className="gl-work-accent">Our work</p>
          <h2 id="our-work-heading">Made for your <span>big moments</span></h2>
          {intro && <p className="gl-work-intro">{intro}</p>}
        </div>
        {/* Up to four per row on desktop. */}
        <ul className="gl-work-gallery" role="list" aria-label="Our floral work" tabIndex={0} style={{ "--gl-work-columns": Math.min(items.length, 4) } as CSSProperties}>
          {items.map((item) => {
            const figure = (
              <figure className="gl-work-figure">
                <div className="gl-work-frame">
                  <div className="gl-work-photo">
                    {item.image ? (
                      <Image
                        src={item.image}
                        style={{ objectPosition: item.imageFocus }}
                        alt={`${item.name} floral work by GLONIA`}
                        fill
                        sizes="(min-width: 1320px) 386px, (min-width: 861px) calc((100vw - 162px) / 3), 206px"
                        className="gl-work-image"
                      />
                    ) : (
                      // Until a photo is added in Site settings → Home page → Our work.
                      <span className="gl-work-placeholder">[{item.name} photo]</span>
                    )}
                  </div>
                </div>
                <figcaption className="gl-work-caption">
                  <h3>{item.name}</h3>
                  {item.description && <p className="gl-work-description">{item.description}</p>}
                </figcaption>
              </figure>
            );
            return (
              <li key={item.name} className="gl-work-card">
                {item.collection ? (
                  <ShopLink href={`/catalog?c=${item.collection}`} className="gl-work-link" whatsapp={`Hi GLONIA, I'm interested in ${item.name}. Please share available designs and prices.`}>
                    {figure}
                  </ShopLink>
                ) : (
                  figure
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
