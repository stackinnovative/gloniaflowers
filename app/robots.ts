import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export const dynamic = "force-static";

// Open to all crawlers, including AI search (GPTBot, ClaudeBot, PerplexityBot, Google-Extended).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/cart" },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
