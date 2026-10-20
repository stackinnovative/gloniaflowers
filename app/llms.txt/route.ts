import { getCollections, getProductsIn, priceLabel, SIZE_INCHES } from "@/lib/products";
import { deliverySlots, site } from "@/lib/site";

export const dynamic = "force-static";

// Plain-text summary for AI assistants (llmstxt.org). Built from the same data as the site.
export function GET() {
  const areas = site.areaServed.map((area) => area.name).join(", ");
  const collections = getCollections()
    .map((collection) => ({ collection, products: getProductsIn(collection.id) }))
    .filter(({ products }) => products.length > 0)
    .map(({ collection, products }) =>
      [
        `### ${collection.name}`,
        ...products.map((p) => `- [${p.name}](${site.url}/product/${p.slug}): ${priceLabel(p)}. ${p.description}`),
      ].join("\n"),
    )
    .join("\n\n");
  const alsoAvailable = [
    ...site.ourWork.items.map((item) => `${item.name}: ${item.description || "enquire on WhatsApp"}`),
    ...(site.perfumes.show ? [`${site.perfumes.title}: ${site.perfumes.badge || site.perfumes.text}`] : []),
  ];

  const body = `# ${site.name}

> Florist in Malaparamba, Kozhikode (Calicut), Kerala, India. Korean bouquets, flower boxes, bridal flowers and wedding car décor, hand-made and delivered fresh. Orders are placed on WhatsApp; there is no online payment.

## Shop

- Address: ${site.address.street}, ${site.address.city}, Kerala, India
- Areas served: ${areas}
- Hours: ${site.hours.label}, every day (India time)
- WhatsApp and phone: ${site.phoneDisplay}
- Email: ${site.email}
- Website: ${site.url}

## How to order

1. Pick flowers at ${site.url}/catalog. Flower boxes come in Small (${SIZE_INCHES.S}), Medium (${SIZE_INCHES.M}) and Large (${SIZE_INCHES.L}).
2. Choose a delivery date and a time slot (${deliverySlots.join(", ")}).
3. Send the order on WhatsApp (https://wa.me/${site.whatsappNumber}); the shop confirms availability and delivery.
4. Custom bouquets for any colour, budget or date can be requested on WhatsApp.

## Flowers and prices (INR)

${collections}

## Also available

${alsoAvailable.map((line) => `- ${line}`).join("\n")}
`;

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
