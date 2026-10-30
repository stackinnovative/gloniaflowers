import { faqJsonLd } from "@/lib/seo";
import { site } from "@/lib/site";
import { waLink } from "@/lib/whatsapp";
import { JsonLd } from "./JsonLd";
import { WhatsAppIcon } from "./Icons";

export function FAQ() {
  const { faq } = site;
  if (!faq.length) return null;

  return (
    <section id="faq" aria-labelledby="faq-heading" className="bg-champagne px-5 py-[60px] lg:px-7 lg:py-[110px]">
      <JsonLd data={faqJsonLd(faq)} />
      <div className="mx-auto flex max-w-[860px] flex-col gap-8 lg:gap-12">
        <div className="text-center">
          <p className="m-0 font-script text-[30px] leading-none text-gold-text lg:text-[36px]">Ask us anything</p>
          <h2
            id="faq-heading"
            className="mb-0 mt-1 font-display text-[34px] font-normal leading-[1.08] lg:mt-1.5 lg:text-[clamp(40px,5vw,66px)] lg:leading-[1.05]"
          >
            Your questions, <span className="italic">answered</span>
          </h2>
        </div>
        <div className="flex flex-col divide-y divide-gold-300 border-y border-gold-300">
          {faq.map((item) => (
            <details key={item.question} className="group py-1 lg:py-2">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-6 py-3 font-display text-[20px] leading-snug focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-500 lg:text-[24px] [&::-webkit-details-marker]:hidden">
                {item.question}
                <span
                  aria-hidden="true"
                  className="flex size-8 shrink-0 items-center justify-center rounded-full border border-gold-400 font-caps text-[18px] text-gold-text transition-transform duration-300 group-open:rotate-45 motion-reduce:transition-none"
                >
                  +
                </span>
              </summary>
              <p className="m-0 max-w-[680px] pb-5 text-[15px] leading-[1.6] text-muted lg:text-[16px]">{item.answer}</p>
            </details>
          ))}
        </div>
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="m-0 text-[15px] text-muted">Still wondering? We reply on WhatsApp.</p>
          <a
            href={waLink("Hi GLONIA, I have a question about your flowers.")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2.5 bg-ink px-[22px] py-[13px] font-caps text-[12px] font-semibold uppercase tracking-[0.16em] text-white"
          >
            <WhatsAppIcon size={16} stroke="#E6CF93" />
            Ask on WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
