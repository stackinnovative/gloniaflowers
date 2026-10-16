import Image from "next/image";
import { getCollection } from "@/lib/products";
import { workPhotoPlaceholders } from "@/lib/site";
import { FloralCorner } from "./FloralCorner";
import "./OurWork.css";

const work = [
  {
    id: "bridal",
    name: "Bridal",
    description: "Bouquets and wedding décor",
  },
  {
    id: "car",
    name: "Car Décor",
    description: "Fresh flowers for the wedding car",
  },
  {
    id: "custom",
    name: "Customized",
    description: "Your colours, your flowers",
  },
];

export function OurWork() {
  return (
    <section id="work" aria-labelledby="our-work-heading" className="gl-work-section">
      <FloralCorner corner="tr" src="br" mirror="y" className="gl-work-floral" />
      <div className="gl-work-content">
        <div className="gl-work-heading">
          <p className="gl-work-accent">Our work</p>
          <h2 id="our-work-heading">Made for your <span>big moments</span></h2>
          <p className="gl-work-intro">Bridal bouquets, wedding car décor and custom pieces.</p>
        </div>
        <ul className="gl-work-gallery" role="list" aria-label="Our floral work" tabIndex={0}>
          {work.map((item) => {
            const image = getCollection(item.id)?.image;
            return (
              <li key={item.id} className="gl-work-card">
                <figure className="gl-work-figure">
                  <div className="gl-work-frame">
                    <div className="gl-work-photo">
                      {image ? (
                        <Image
                          src={image}
                          alt={`${item.name} floral work by GLONIA`}
                          fill
                          sizes="(min-width: 1320px) 386px, (min-width: 861px) calc((100vw - 162px) / 3), 206px"
                          className="gl-work-image"
                        />
                      ) : (
                        <span className="gl-work-placeholder">{workPhotoPlaceholders[item.id]}</span>
                      )}
                    </div>
                  </div>
                  <figcaption className="gl-work-caption">
                    <h3>{item.name}</h3>
                    <p className="gl-work-description">{item.description}</p>
                  </figcaption>
                </figure>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
