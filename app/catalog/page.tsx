import type { Metadata } from "next";
import { Suspense } from "react";
import { Catalog, CatalogContent } from "@/components/Catalog";
import { JsonLd } from "@/components/JsonLd";
import { ShopClosed, ShopGate } from "@/components/ShopPause";
import { getProducts } from "@/lib/products";
import { breadcrumbJsonLd, catalogJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Shop Flowers in Kozhikode",
  description:
    "Fresh flowers in Calicut: Korean bouquets from ₹200 and flower boxes in four sizes, with same day flower delivery in Kozhikode. Browse by collection and budget, then order on WhatsApp.",
  // Collection filters are query parameters on this same page.
  alternates: { canonical: "/catalog" },
  openGraph: { title: "Shop Flowers in Kozhikode · GLONIA", url: "/catalog" },
};

export default function CatalogPage() {
  return (
    <>
      <JsonLd data={catalogJsonLd(getProducts())} />
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Shop", path: "/catalog" }])} />
      <ShopGate paused={<ShopClosed />}>
        <Suspense fallback={<CatalogContent />}><Catalog /></Suspense>
      </ShopGate>
    </>
  );
}
