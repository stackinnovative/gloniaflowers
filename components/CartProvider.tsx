"use client";

import { createContext, useContext, useSyncExternalStore } from "react";
import { addCartItem, cartOrderLines, normalizeCart, type CartItem, type CartSelection } from "@/lib/cart";
import { isValidDeliveryDate, subscribeIndiaDate, todayInIndia } from "@/lib/delivery";
import type { OrderLine } from "@/lib/whatsapp";

export type { CartItem } from "@/lib/cart";

type CartContextValue = {
  items: CartItem[];
  count: number;
  total: number;
  orderLines: OrderLine[];
  hasUnpricedAddOns: boolean;
  hasExpiredDelivery: boolean;
  add: (item: CartSelection, quantity?: number) => void;
  clear: () => void;
};

const STORAGE_KEY = "glonia-cart";
const EMPTY: CartItem[] = [];

// A tiny external store over localStorage so every tab and component sees the same cart.
let cache: CartItem[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function read(): CartItem[] {
  if (typeof window === "undefined") return EMPTY;
  if (!loaded) {
    loaded = true;
    try {
      const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
      cache = normalizeCart(parsed);
    } catch {
      cache = EMPTY;
    }
  }
  return cache;
}

function write(items: CartItem[]) {
  cache = items;
  loaded = true;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage blocked (private mode etc.) — cart still works for this page view.
  }
  listeners.forEach((l) => l());
}

function onStorage(event: StorageEvent) {
  // localStorage.clear() sends a null key rather than the cart key.
  if (event.key !== STORAGE_KEY && event.key !== null) return;
  try {
    if (event.storageArea && event.storageArea !== window.localStorage) return;
  } catch {
    // Access can be blocked; read() falls back to an empty cart.
  }
  loaded = false;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  if (listeners.size === 0) {
    // Refresh after any time spent without a mounted provider.
    loaded = false;
    window.addEventListener("storage", onStorage);
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(subscribe, read, () => EMPTY);
  const today = useSyncExternalStore(subscribeIndiaDate, todayInIndia, () => null);
  const orderLines = cartOrderLines(items);

  const value: CartContextValue = {
    items,
    count: items.reduce((sum, i) => sum + i.qty, 0),
    total: orderLines.reduce((sum, line) => sum + line.unitPrice * line.qty, 0),
    orderLines,
    hasUnpricedAddOns: orderLines.some((line) => line.hasUnpricedAddOns === true),
    hasExpiredDelivery: today !== null && items.some((item) => item.delivery && !isValidDeliveryDate(item.delivery.date, today)),
    add: (item, quantity = 1) => {
      const current = read();
      const next = addCartItem(current, item, quantity);
      if (next !== current) write(next);
    },
    clear: () => write(EMPTY),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
