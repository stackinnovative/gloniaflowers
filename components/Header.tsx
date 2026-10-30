"use client";

import Image from "./SiteImage";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { site } from "@/lib/site";
import { waLink } from "@/lib/whatsapp";
import { useCart } from "./CartProvider";
import { CartIcon, WhatsAppIcon } from "./Icons";
import { MobileMenu } from "./MobileMenu";
import { useShopPaused } from "./ShopPause";

type NavItem = { label: string; href: string };

const NAV_LEFT: NavItem[] = [
  { label: "Shop now", href: "/catalog" },
  { label: "Collections", href: "/#collections" },
  { label: "Gifts", href: "/catalog?c=gifts" },
  { label: "Bridal", href: "/#work" },
];

// The Perfumes link goes with the home page section (Site settings → Perfumes → Show).
const NAV_RIGHT: NavItem[] = [
  ...(site.perfumes.show ? [{ label: "Perfumes", href: "/#perfumes" }] : []),
  { label: "Contact", href: "#contact" },
];

const navLinkClass =
  "py-1 font-caps text-[13px] font-semibold uppercase tracking-[0.12em] border-b border-transparent xl:text-[14px] xl:tracking-[0.14em]";

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      prefetch={false}
      aria-current={active ? "page" : undefined}
      className={`${navLinkClass} ${active ? "border-gold-500 text-gold-text" : ""}`}
    >
      {item.label}
    </Link>
  );
}

function CartLink({ active }: { active: boolean }) {
  const { count } = useCart();
  return (
    <Link
      href="/cart"
      prefetch={false}
      aria-label={`Cart, ${count} ${count === 1 ? "item" : "items"}`}
      aria-current={active ? "page" : undefined}
      className={`relative inline-flex size-11 items-center justify-center lg:border ${active ? "lg:border-gold-500" : "lg:border-line"}`}
    >
      <CartIcon size={20} stroke="#1A1A1A" />
      {count > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold-500 px-1 text-[11px] font-bold text-ink">
          {count}
        </span>
      )}
    </Link>
  );
}

/** True once the hero's logo has scrolled up under the sticky header (home page only). */
function useHeroLogoScrolledPast(active: boolean): boolean {
  const [past, setPast] = useState(false);
  useEffect(() => {
    const hero = active ? document.getElementById("hero-title") : null;
    if (!hero) return;
    const headerHeight = Math.round(document.querySelector("header")?.getBoundingClientRect().height ?? 0);
    const observer = new IntersectionObserver(
      ([entry]) => setPast(!entry.isIntersecting && entry.boundingClientRect.top < headerHeight),
      { rootMargin: `-${headerHeight}px 0px 0px 0px` },
    );
    observer.observe(hero);
    return () => {
      observer.disconnect();
      setPast(false);
    };
  }, [active]);
  return past;
}

/**
 * On the home page the hero shows the full logo, so the header emblem stays hidden (keeping its
 * space) until the hero logo scrolls out of view, then fades in.
 */
function Logo({ className, hidden }: { className: string; hidden: boolean }) {
  return (
    <Link
      href="/"
      prefetch={false}
      aria-label="GLONIA home"
      aria-hidden={hidden || undefined}
      tabIndex={hidden ? -1 : undefined}
      className={`flex flex-none transition-opacity duration-300 motion-reduce:transition-none ${hidden ? "pointer-events-none opacity-0" : "opacity-100"}`}
    >
      {/* Just the G emblem; the full wordmark is in the hero and footer. */}
      <Image src="/images/logo-mark.webp" alt="GLONIA Flowers & Perfumes" width={225} height={225} loading="eager" className={className} />
    </Link>
  );
}

export function Header() {
  const pathname = usePathname();
  const shopActive = pathname.startsWith("/catalog") || pathname.startsWith("/product");
  const onHome = pathname === "/";
  const heroLogoScrolledPast = useHeroLogoScrolledPast(onHome);
  const logoHidden = onHome && !heroLogoScrolledPast;
  // While the shop is paused, links into the shop and the cart are hidden.
  const paused = useShopPaused();
  const navLeft = paused ? NAV_LEFT.filter((item) => !item.href.startsWith("/catalog")) : NAV_LEFT;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white">
      {/* Mobile / tablet */}
      <div className="grid grid-cols-[44px_1fr_44px] items-center px-3 py-2 lg:hidden">
        <MobileMenu />
        <div className="flex justify-center">
          <Logo hidden={logoHidden} className="size-12" />
        </div>
        {paused ? <span aria-hidden="true" /> : <CartLink active={pathname === "/cart"} />}
      </div>

      {/* Desktop */}
      {/* Wider than the page content so the nav sits close to the screen edges. */}
      <div className="mx-auto hidden max-w-[1600px] items-center justify-between gap-4 px-5 py-3.5 lg:flex xl:px-6">
        <nav aria-label="Main" className="flex flex-1 flex-wrap gap-[18px] xl:gap-[26px]">
          {navLeft.map((item) => (
            <NavLink key={item.href} item={item} active={item.href === "/catalog" && shopActive} />
          ))}
        </nav>
        <Logo hidden={logoHidden} className="size-16" />
        <div className="flex flex-1 flex-wrap items-center justify-end gap-4 xl:gap-[22px]">
          <nav aria-label="More" className="flex gap-4 xl:gap-[22px]">
            {NAV_RIGHT.map((item) => (
              <NavLink key={item.href} item={item} active={false} />
            ))}
          </nav>
          {!paused && <CartLink active={pathname === "/cart"} />}
          <a
            href={waLink()}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Order on WhatsApp"
            className="inline-flex min-h-11 items-center gap-2.5 whitespace-nowrap bg-ink px-4 py-[13px] font-caps text-[13px] font-semibold uppercase tracking-[0.1em] text-white hover:text-gold-200 xl:px-5 xl:text-[14px]"
          >
            <WhatsAppIcon size={16} stroke="#D9BE84" />
            {/* Shorter label on small laptops so the nav stays on one line. */}
            <span><span className="hidden xl:inline">Order on </span>WhatsApp</span>
          </a>
        </div>
      </div>
    </header>
  );
}
