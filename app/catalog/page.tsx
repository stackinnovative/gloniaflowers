import type { Metadata } from "next";
import { Suspense } from "react";
import { Catalog, CatalogContent } from "@/components/Catalog";
import { JsonLd } from "@/components/JsonLd";
import { getProducts } from "@/lib/products";
import { breadcrumbJsonLd, catalogJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Shop Flowers in Kozhikode",
  description:
    "Korean bouquets from ₹200 and flower boxes in three sizes, made fresh in Kozhikode (Calicut). Browse by collection and budget, then order on WhatsApp for delivery.",
  // Collection filters are query parameters on this same page.
  alternates: { canonical: "/catalog" },
  openGraph: { title: "Shop Flowers in Kozhikode · GLONIA", url: "/catalog" },
};

export default function CatalogPage() {
  return (
    <>
      <JsonLd data={catalogJsonLd(getProducts())} />
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Shop", path: "/catalog" }])} />
      <Suspense fallback={<CatalogContent />}><Catalog /></Suspense>
    </>
  );
}
