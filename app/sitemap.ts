import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/products";
import { site } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: site.url, changeFrequency: "weekly", priority: 1 },
    { url: `${site.url}/catalog`, changeFrequency: "weekly", priority: 0.9 },
    ...getProducts().map((product) => ({
      url: `${site.url}/product/${product.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
      // Next writes image URLs into the XML unescaped; CDN URLs contain "&".
      images: [(product.image.startsWith("http") ? product.image : `${site.url}${product.image}`).replace(/&/g, "&amp;")],
    })),
  ];
}
