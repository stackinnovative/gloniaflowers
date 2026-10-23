"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { sizeKeys, type SizeKey, type Sizes } from "@/lib/products";

/**
 * Applies `?size=S|M|L|XL` (set by the catalogue card) to the product page, if the product offers it.
 * Render inside <Suspense>: reading search params opts only this component out of
 * static rendering, so the rest of the product page stays pre-rendered.
 */
export function SizeFromUrl({ sizes, onSize }: { sizes: Sizes; onSize: (size: SizeKey) => void }) {
  const size = useSearchParams().get("size");
  useEffect(() => {
    const match = sizeKeys(sizes).find((key) => key === size);
    if (match) onSize(match);
  }, [size, sizes, onSize]);
  return null;
}
