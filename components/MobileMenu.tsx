"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { site } from "@/lib/site";
import { FloralCorner } from "./FloralCorner";
import { CloseIcon, MenuIcon } from "./Icons";

const MENU = [
  { label: "Home", href: "/" },
  { label: "Shop all", href: "/catalog" },
  { label: "Korean Bouquets", href: "/catalog?c=korean" },
  { label: "Flower Boxes", href: "/catalog?c=bloom" },
  { label: "Gifts", href: "/catalog?c=gifts" },
  { label: "Bridal & Car Décor", href: "/#work" },
  // Goes with the home page section (Site settings → Perfumes → Show).
  ...(site.perfumes.show ? [{ label: "Perfumes", href: "/#perfumes" }] : []),
  { label: "Contact", href: "#contact" },
];

/** Hamburger + slide-in drawer. Native <dialog> gives focus trapping and Esc to close. */
export function MobileMenu() {
  const dialogId = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const close = () => dialog.current?.close();

  useEffect(() => {
    if (!open) return;
    const menu = dialog.current;
    const desktop = window.matchMedia("(min-width: 1024px)");
    const onDesktop = () => { if (desktop.matches) menu?.close(); };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    desktop.addEventListener("change", onDesktop);
    onDesktop();
    return () => {
      document.body.style.overflow = previousOverflow;
      desktop.removeEventListener("change", onDesktop);
    };
  }, [open]);

  return (
    <>
      <button
        ref={trigger}
        type="button"
        aria-label="Open menu"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={dialogId}
        onClick={() => {
          if (!dialog.current || dialog.current.open) return;
          dialog.current.showModal();
          setOpen(true);
        }}
        className="flex size-11 items-center justify-center"
      >
        <MenuIcon size={24} stroke="#1A1A1A" />
      </button>

      <dialog
        id={dialogId}
        ref={dialog}
        aria-label="Menu"
        onClose={() => {
          setOpen(false);
          trigger.current?.focus({ preventScroll: true });
        }}
        onKeyDown={(event) => {
          if (event.key !== "Tab") return;
          const controls = event.currentTarget.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
          const first = controls[0];
          const last = controls[controls.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }}
        onClick={(e) => e.target === e.currentTarget && close()}
        className="m-0 h-dvh max-h-none w-[312px] max-w-[85vw] overflow-y-auto overscroll-contain bg-white p-0 shadow-[0_0_40px_rgba(26,26,26,0.25)] backdrop:bg-ink/45"
      >
        <div className="relative flex min-h-full flex-col gap-1.5 px-6 py-[18px]">
          <FloralCorner corner="br" src="br" className="w-[220px]" />
          <div className="relative flex items-center justify-between pb-[18px]">
            <Image src="/images/logo.png" alt="GLONIA" width={515} height={430} className="h-14 w-auto" />
            <button
              type="button"
              aria-label="Close menu"
              onClick={close}
              className="flex size-11 items-center justify-center border border-line bg-white"
            >
              <CloseIcon size={18} stroke="#1A1A1A" />
            </button>
          </div>
          <nav aria-label="Mobile" className="relative flex flex-col">
            {MENU.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={close}
                className="border-b border-[#F0E9DC] py-2 font-display text-[26px]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <p className="relative m-0 pt-[18px] text-[13px] text-muted">
            {site.email}
            <br />
            {site.phoneDisplay}
          </p>
        </div>
      </dialog>
    </>
  );
}
