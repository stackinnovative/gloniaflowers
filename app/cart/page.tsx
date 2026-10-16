import type { Metadata } from "next";
import { CartPage } from "@/components/CartPage";

export const metadata: Metadata = {
  title: "Your cart",
  description: "Review your flowers, sizes, add-ons and delivery slots, then send your order to GLONIA on WhatsApp.",
  robots: { index: false },
};

export default function Cart() {
  return <CartPage />;
}
