"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { waLink } from "@/lib/whatsapp";
import { useCart } from "./CartProvider";
import { CartIcon, WhatsAppIcon } from "./Icons";
import { MobileMenu } from "./MobileMenu";

type NavItem = { label: string; href: string };

const NAV_LEFT: NavItem[] = [
  { label: "Shop now", href: "/catalog" },
  { label: "Collections", href: "/#collections" },
  { label: "Bridal", href: "/#work" },
];

const NAV_RIGHT: NavItem[] = [
  { label: "Perfumes", href: "/#perfumes" },
  { label: "Contact", href: "#contact" },
];

const navLinkClass =
  "py-1 font-caps text-[13px] font-semibold uppercase tracking-[0.14em] border-b border-transparent";

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

function Logo({ className, priority }: { className: string; priority: boolean }) {
  return (
    <Link href="/" prefetch={false} aria-label="GLONIA home" className="flex flex-none">
      {/* Just the G emblem; the full wordmark is in the hero and footer. */}
      <Image src="/images/logo-mark.png" alt="GLONIA Flowers & Perfumes" width={225} height={225} loading="eager" fetchPriority={priority ? "high" : "low"} className={className} />
    </Link>
  );
}

export function Header() {
  const pathname = usePathname();
  const shopActive = pathname.startsWith("/catalog") || pathname.startsWith("/product");

  return (
    <header className="border-b border-line bg-white">
      {/* Mobile / tablet */}
      <div className="grid grid-cols-[44px_1fr_44px] items-center px-3 py-2 lg:hidden">
        <MobileMenu />
        <div className="flex justify-center">
          <Logo priority={pathname === "/"} className="size-12" />
        </div>
        <CartLink active={pathname === "/cart"} />
      </div>

      {/* Desktop */}
      <div className="mx-auto hidden max-w-site items-center justify-between gap-[18px] px-7 py-3.5 lg:flex">
        <nav aria-label="Main" className="flex flex-1 flex-wrap gap-[26px]">
          {NAV_LEFT.map((item) => (
            <NavLink key={item.href} item={item} active={item.href === "/catalog" && shopActive} />
          ))}
        </nav>
        <Logo priority={pathname === "/"} className="size-16" />
        <div className="flex flex-1 flex-wrap items-center justify-end gap-[22px]">
          <nav aria-label="More" className="flex gap-[22px]">
            {NAV_RIGHT.map((item) => (
              <NavLink key={item.href} item={item} active={false} />
            ))}
          </nav>
          <CartLink active={pathname === "/cart"} />
          <a
            href={waLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2.5 bg-ink px-5 py-[13px] font-caps text-[13px] font-semibold uppercase tracking-[0.1em] text-white hover:text-gold-200"
          >
            <WhatsAppIcon size={16} stroke="#D9BE84" />
            Order on WhatsApp
          </a>
        </div>
      </div>
    </header>
  );
}
