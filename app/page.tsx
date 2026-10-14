import type { Metadata } from "next";
import { CollectionsBento } from "@/components/CollectionsBento";
import { FavouritePicks } from "@/components/FavouritePicks";
import { Gallery } from "@/components/Gallery";
import { Hero } from "@/components/Hero";
import { HowToOrder } from "@/components/HowToOrder";
import { OurWork } from "@/components/OurWork";
import { PerfumeTeaser } from "@/components/PerfumeTeaser";
import { SizeReference } from "@/components/SizeReference";

export const metadata: Metadata = {
  title: { absolute: "GLONIA Flowers & Perfumes — Korean bouquets & flower boxes" },
  description: "Explore Korean bouquets, fresh flower boxes and wedding florals from GLONIA. Pick your flowers and order on WhatsApp.",
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <CollectionsBento />
      <FavouritePicks />
      <SizeReference />
      <OurWork />
      <HowToOrder />
      <PerfumeTeaser />
      <Gallery />
    </>
  );
}
