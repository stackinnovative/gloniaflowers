import type { Metadata } from "next";
import { Suspense } from "react";
import { Catalog, CatalogContent } from "@/components/Catalog";

export const metadata: Metadata = {
  title: "Shop flowers",
  description: "Shop Korean bouquets, classic flower boxes and blooming boxes. Browse by collection and budget, then order your flowers on WhatsApp.",
};

export default function CatalogPage() {
  return <Suspense fallback={<CatalogContent />}><Catalog /></Suspense>;
}
