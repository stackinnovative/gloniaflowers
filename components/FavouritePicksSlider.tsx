"use client";

import Link from "next/link";
import { useEffect, useReducer, useRef, useState, useSyncExternalStore } from "react";
import type { Collection, Product } from "@/lib/products";
import { FavouriteProducts } from "./FavouriteProducts";
import "./FavouritePicks.css";

type CollectionPicks = Collection & { products: Product[] };
type Direction = -1 | 1;
type Slide = { index: number; direction: Direction | 0 };
type SlideAction =
  | { type: "move"; direction: Direction; count: number; immediate: boolean }
  | { type: "finish"; count: number }
  | { type: "select"; index: number };

const wrap = (index: number, count: number) => ((index % count) + count) % count;

function slideReducer(slide: Slide, action: SlideAction): Slide {
  if (action.type === "select") return { index: action.index, direction: 0 };
  if (action.type === "finish") return { index: wrap(slide.index + slide.direction, action.count), direction: 0 };
  if (slide.direction || action.count < 2) return slide;
  return action.immediate
    ? { index: wrap(slide.index + action.direction, action.count), direction: 0 }
    : { ...slide, direction: action.direction };
}

function subscribeMotion(notify: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", notify);
  return () => query.removeEventListener("change", notify);
}

function subscribeVisibility(notify: () => void) {
  document.addEventListener("visibilitychange", notify);
  return () => document.removeEventListener("visibilitychange", notify);
}

const reducedMotionSnapshot = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const hiddenSnapshot = () => document.hidden;
const pausedServerSnapshot = () => true;

export function FavouritePicksSlider({ collections }: { collections: CollectionPicks[] }) {
  const count = collections.length;
  const [slide, dispatch] = useReducer(slideReducer, { index: 0, direction: 0 });
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [touching, setTouching] = useState(false);
  const [playing, setPlaying] = useState(true);
  const reducedMotion = useSyncExternalStore(subscribeMotion, reducedMotionSnapshot, pausedServerSnapshot);
  const hidden = useSyncExternalStore(subscribeVisibility, hiddenSnapshot, pausedServerSnapshot);
  const tabs = useRef(new Map<string, HTMLButtonElement>());
  const focusSelection = useRef(false);
  const activeIndex = wrap(slide.index + slide.direction, count);
  const active = collections[activeIndex];
  const canAutoplay = playing && !reducedMotion && !hidden && !hovered && !focused && !touching && count > 1;

  useEffect(() => {
    if (!canAutoplay) return;
    const timer = window.setInterval(() => {
      dispatch({ type: "move", direction: 1, count, immediate: false });
    }, 3000);
    return () => window.clearInterval(timer);
  }, [canAutoplay, count]);

  useEffect(() => {
    if (!slide.direction) return;
    // Also completes when a tab is hidden or reduced motion cancels the animation.
    const timer = window.setTimeout(() => dispatch({ type: "finish", count }), reducedMotion ? 0 : 650);
    return () => window.clearTimeout(timer);
  }, [slide.direction, count, reducedMotion]);

  useEffect(() => {
    if (focusSelection.current) {
      tabs.current.get(active.id)?.focus({ preventScroll: true });
      focusSelection.current = false;
    }
  }, [active.id]);

  function move(direction: Direction, focus = false) {
    if (slide.direction) return;
    focusSelection.current = focus;
    dispatch({ type: "move", direction, count, immediate: reducedMotion });
  }

  function select(index: number) {
    focusSelection.current = index !== activeIndex;
    dispatch({ type: "select", index });
  }

  // Five keyed titles let the neighbouring three slide through the viewport.
  // Recentring after each step preserves the selected button and keyboard focus.
  const offsets = count > 2 ? [-2, -1, 0, 1, 2] : Array.from({ length: count }, (_, index) => index);

  return (
    <section
      id="favourite-picks"
      aria-labelledby="favourite-picks-heading"
      className="gl-picks-section"
      data-active-collection={active.id}
      onPointerEnter={(event) => { if (event.pointerType === "mouse") setHovered(true); }}
      onPointerLeave={() => { setHovered(false); setTouching(false); }}
      onPointerDown={(event) => { if (event.pointerType === "touch") setTouching(true); }}
      onPointerUp={() => setTouching(false)}
      onPointerCancel={() => setTouching(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
    >
      <div className="gl-picks-heading">
        <p className="gl-picks-accent">Signature</p>
        <h2 id="favourite-picks-heading">Our favourite <span>picks</span></h2>
      </div>

      <div className="gl-picks-navigation">
        <button type="button" className="gl-picks-arrow gl-picks-previous" aria-label="Previous collection" aria-controls="favourite-picks-panel" aria-disabled={!!slide.direction} onClick={() => move(-1)}>
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true"><path d="M10 3L5 8l5 5" /></svg>
        </button>
        <div role="tablist" aria-label="Favourite collections" className="gl-picks-viewport">
          <div
            className="gl-picks-track"
            data-direction={slide.direction === 1 ? "next" : slide.direction === -1 ? "previous" : "idle"}
            onAnimationEnd={(event) => { if (event.target === event.currentTarget) dispatch({ type: "finish", count }); }}
          >
            {offsets.map((offset) => {
              const collection = collections[wrap(slide.index + offset, count)];
              const selected = collection.id === active.id;
              const visible = Math.abs(offset - slide.direction) <= 1;
              return (
                <button
                  key={collection.id}
                  ref={(node) => { if (node) tabs.current.set(collection.id, node); else tabs.current.delete(collection.id); }}
                  id={`favourite-tab-${collection.id}`}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls="favourite-picks-panel"
                  aria-hidden={!visible || undefined}
                  inert={!visible}
                  tabIndex={selected ? 0 : -1}
                  className="gl-picks-tab"
                  onClick={() => { if (offset === -1 || offset === 1) move(offset); }}
                  onKeyDown={(event) => {
                    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
                      event.preventDefault();
                      move(event.key === "ArrowLeft" ? -1 : 1, true);
                    } else if (event.key === "Home" || event.key === "End") {
                      event.preventDefault();
                      select(event.key === "Home" ? 0 : count - 1);
                    }
                  }}
                >
                  {collection.name}
                </button>
              );
            })}
          </div>
        </div>
        <button type="button" className="gl-picks-arrow gl-picks-next" aria-label="Next collection" aria-controls="favourite-picks-panel" aria-disabled={!!slide.direction} onClick={() => move(1)}>
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true"><path d="M6 3l5 5-5 5" /></svg>
        </button>
        <button
          type="button"
          className="gl-picks-playback"
          disabled={reducedMotion}
          aria-label={reducedMotion ? "Automatic rotation disabled by reduced motion preference" : playing ? "Pause automatic rotation" : "Start automatic rotation"}
          onClick={() => setPlaying(!playing)}
        >
          {reducedMotion ? "Paused" : playing ? "Pause" : "Play"}
        </button>
      </div>

      <p className="sr-only" aria-live={canAutoplay ? "off" : "polite"} aria-atomic="true">
        {active.name}: {active.products.length ? `${active.products.length} products` : "Coming soon"}
      </p>
      <div id="favourite-picks-panel" role="tabpanel" aria-labelledby={`favourite-tab-${active.id}`} tabIndex={0} className="gl-picks-panel">
        <FavouriteProducts key={active.id} collection={active} products={active.products} />
      </div>
      <div className="gl-picks-catalogue">
        <Link href="/catalog">View full catalogue</Link>
      </div>
    </section>
  );
}
