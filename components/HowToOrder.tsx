import Image from "next/image";
import { defaultSize, getProduct, SIZE_NAMES, sizePrice } from "@/lib/products";
import { site } from "@/lib/site";
import { formatPrice } from "@/lib/whatsapp";

const steps = [
  {
    title: "Pick your flowers",
    description: "Browse the catalogue and tap the one you love.",
  },
  {
    title: "Choose date & time",
    description: "Pick your delivery date and time.",
  },
  {
    title: "Order on WhatsApp",
    description: "Your order is typed for you. Just hit send.",
  },
  {
    title: "We deliver fresh, on time",
    description: "Hand-made on the day of delivery.",
  },
];

function OrderExample() {
  const product = getProduct(site.featured.orderExample);
  if (!product) return null;

  return (
    <figure
      aria-label="Example WhatsApp order conversation"
      className="m-0 flex w-full max-w-[380px] flex-col gap-3 rounded-[36px] border-[10px] border-ink bg-[#ECE5DD] p-[18px] shadow-[0_40px_80px_rgba(26,26,26,0.15)]"
    >
      <figcaption className="flex items-center gap-2.5 border-b border-[#D8CEC4] px-1 pb-3 pt-1.5">
        <Image
          src="/images/logo.png"
          alt=""
          width={40}
          height={40}
          className="size-10 rounded-full bg-white object-contain p-1"
        />
        <div>
          <p className="m-0 text-[15px] font-bold">{site.shortName}</p>
          <p className="m-0 text-[12px] text-[#46612F]">online</p>
        </div>
        <span className="ml-auto text-[11px] uppercase tracking-[0.1em] text-muted">Example</span>
      </figcaption>
      <div className="flex max-w-[80%] flex-col gap-1.5 self-end rounded-[16px_16px_4px_16px] bg-[#D9FDD3] p-2">
        <Image
          src={product.image}
          style={{ objectPosition: product.imageFocus }}
          alt={product.name}
          width={400}
          height={300}
          sizes="250px"
          className="aspect-[4/3] w-full rounded-[10px] object-cover"
        />
        <p className="m-0 px-1 text-[14px]">
          <span className="sr-only">You: </span>
          Hi! I&apos;d like the <strong>{product.name}</strong>{product.sizes ? `, size ${SIZE_NAMES[defaultSize(product.sizes, "M")]} (${formatPrice(sizePrice(product.sizes, "M"))})` : ` (${formatPrice(product.price)})`}, for tomorrow.
        </p>
      </div>
      <p className="m-0 max-w-[80%] self-start rounded-[16px_16px_16px_4px] bg-white px-3 py-2.5 text-[14px]">
        <span className="sr-only">{site.shortName}: </span>
        Lovely choice! Please share the delivery address and your message for the card.
      </p>
      <p className="m-0 max-w-[80%] self-end rounded-[16px_16px_4px_16px] bg-[#D9FDD3] px-3 py-2.5 text-[14px]">
        <span className="sr-only">You: </span>
        Sent. Thank you!
      </p>
    </figure>
  );
}

export function HowToOrder() {
  return (
    <section
      id="how-to-order"
      aria-labelledby="how-to-order-heading"
      className="mx-auto max-w-site px-5 py-[60px] lg:flex lg:items-center lg:gap-16 lg:px-7 lg:py-[120px]"
    >
      <div className="flex min-w-0 flex-col gap-5 lg:flex-[1_1_460px] lg:gap-8">
        <div className="text-center lg:text-left">
          <p className="m-0 font-script text-[30px] leading-none text-gold-text lg:text-[36px]">Easy ordering</p>
          <h2
            id="how-to-order-heading"
            className="mb-0 mt-1 font-display text-[34px] font-normal leading-[1.08] lg:mt-1.5 lg:text-[clamp(40px,5vw,66px)] lg:leading-[1.05]"
          >
            Order in <span className="italic">one minute</span>
          </h2>
        </div>
        <ol role="list" className="m-0 flex list-none flex-col gap-5 p-0 lg:gap-8">
          {steps.map((step, index) => (
            <li key={step.title} className="flex items-start gap-4 lg:gap-[22px]">
              <span
                aria-hidden="true"
                className="flex size-11 shrink-0 items-center justify-center rounded-full border border-gold-400 font-display text-[18px] text-gold-text lg:size-14 lg:text-[22px]"
              >
                {index + 1}
              </span>
              <div>
                <h3 className="m-0 text-[16px] font-bold lg:text-[18px]">{step.title}</h3>
                <p className="m-0 text-[14px] text-muted lg:text-[16px]">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
      <div className="hidden min-w-0 justify-center lg:flex lg:flex-[1_1_400px]">
        <OrderExample />
      </div>
    </section>
  );
}
