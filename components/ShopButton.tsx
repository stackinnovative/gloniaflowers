"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "./CartProvider";
import { GridIcon } from "./Icons";
import { useShopPaused } from "./ShopPause";
import "./ShopButton.css";

/** Floating link to the catalogue, shown on every page except the catalogue itself, and hidden while the shop is paused. */
export function ShopButton() {
  const pathname = usePathname();
  const { count } = useCart();
  const paused = useShopPaused();

  if (paused || pathname.startsWith("/catalog")) return null;

  // Sit above the cart bar whenever it is showing (it hides itself on /cart).
  const lifted = count > 0 && pathname !== "/cart";

  return (
    <Link href="/catalog" className={`gl-shop-fab${lifted ? " gl-shop-fab--lifted" : ""}`}>
      <GridIcon size={16} stroke="#D9BE84" />
      <span>Shop now</span>
    </Link>
  );
}
