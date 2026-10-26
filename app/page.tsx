import type { Metadata } from "next";
import { CollectionsBento } from "@/components/CollectionsBento";
import { FavouritePicks } from "@/components/FavouritePicks";
import { Gallery } from "@/components/Gallery";
import { GoogleReviews } from "@/components/GoogleReviews";
import { Hero } from "@/components/Hero";
import { HowToOrder } from "@/components/HowToOrder";
import { OurWork } from "@/components/OurWork";
import { PerfumeTeaser } from "@/components/PerfumeTeaser";
import { ShopGate, ShopPauseBanner } from "@/components/ShopPause";
import { SizeReference } from "@/components/SizeReference";

export const metadata: Metadata = {
  title: { absolute: "GLONIA — Florist in Kozhikode | Korean Bouquets & Flower Boxes" },
  description:
    "Florist in Malaparamba, Kozhikode (Calicut). Korean bouquets, flower boxes, bridal bouquets and wedding car décor, hand-made and delivered fresh across Kozhikode. Order on WhatsApp.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <ShopPauseBanner />
      <Hero />
      <CollectionsBento />
      <FavouritePicks />
      <SizeReference />
      <OurWork />
      <ShopGate><HowToOrder /></ShopGate>
      <PerfumeTeaser />
      <GoogleReviews />
      <Gallery />
    </>
  );
}
