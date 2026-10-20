"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { SIZE_KEYS, type SizeKey } from "@/lib/products";

/**
 * Applies `?size=S|M|L` (set by the catalogue card) to the product page.
 * Render inside <Suspense>: reading search params opts only this component out of
 * static rendering, so the rest of the product page stays pre-rendered.
 */
export function SizeFromUrl({ onSize }: { onSize: (size: SizeKey) => void }) {
  const size = useSearchParams().get("size");
  useEffect(() => {
    const match = SIZE_KEYS.find((key) => key === size);
    if (match) onSize(match);
  }, [size, onSize]);
  return null;
}
