// Structured data and plain-text facts for search engines and AI assistants.
import { getCollection, getProducts, type Product } from "./products";
import { site } from "./site";
import { formatPrice } from "./whatsapp";

const floristId = `${site.url}/#florist`;

/** "Calicut 673009" → "673009" */
const postalCode = site.address.city.match(/\b\d{6}\b/)?.[0];

/** "11.289957,75.797104" → coordinates; a text address has none. */
const coordinates = site.mapQuery.match(/^(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)$/);

const googleListingUrl = site.googleListing
  ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.googleListing)}`
  : null;

// Placeholder values ("[@instagram handle]", a bare instagram.com) are left out.
const instagramUrl = /instagram\.com\/[^/?#]+/.test(site.instagram.url) ? site.instagram.url : null;

const absolute = (path: string) => (path.startsWith("http") ? path : `${site.url}${path}`);

function priceRange(): string {
  const prices = getProducts().flatMap((p) => (p.sizes ? Object.values(p.sizes) : [p.price]));
  return `${formatPrice(Math.min(...prices))} – ${formatPrice(Math.max(...prices))}`;
}

export function floristJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Florist",
    "@id": floristId,
    name: site.name,
    alternateName: site.googleListing.split(",")[0] || undefined,
    description: site.description,
    url: site.url,
    logo: absolute("/images/logo.png"),
    image: [absolute("/images/logo.png"), ...getProducts().slice(0, 3).map((p) => absolute(p.image))],
    telephone: site.phoneTel,
    email: site.email,
    priceRange: priceRange(),
    currenciesAccepted: "INR",
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      addressLocality: site.address.locality,
      addressRegion: site.address.region,
      postalCode,
      addressCountry: site.address.country,
    },
    ...(coordinates && {
      geo: { "@type": "GeoCoordinates", latitude: Number(coordinates[1]), longitude: Number(coordinates[2]) },
    }),
    ...(googleListingUrl && { hasMap: googleListingUrl }),
    sameAs: [googleListingUrl, instagramUrl].filter(Boolean),
    areaServed: site.areaServed.map((area) => ({ "@type": area.type, name: area.name })),
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: site.hours.open,
      closes: site.hours.close,
    },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: site.url,
    inLanguage: "en-IN",
    publisher: { "@id": floristId },
  };
}

type Crumb = { name: string; path: string };

export function breadcrumbJsonLd(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absolute(crumb.path),
    })),
  };
}

export function productJsonLd(product: Product) {
  const url = absolute(`/product/${product.slug}`);
  const prices = product.sizes ? Object.values(product.sizes) : [product.price];
  const offerBase = { priceCurrency: "INR", availability: "https://schema.org/InStock", url, seller: { "@id": floristId } };
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: absolute(product.image),
    sku: product.slug,
    brand: { "@type": "Brand", name: site.shortName },
    category: getCollection(product.collection)?.name,
    offers: product.sizes
      ? { "@type": "AggregateOffer", ...offerBase, lowPrice: Math.min(...prices), highPrice: Math.max(...prices), offerCount: prices.length }
      : { "@type": "Offer", ...offerBase, price: product.price },
  };
}

export function catalogJsonLd(products: Product[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Flowers from ${site.name}`,
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absolute(`/product/${product.slug}`),
      name: product.name,
    })),
  };
}

/** Escape "<" so content can't close the script tag. */
export function jsonLdScript(data: object): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
