"use client";

import Link from "next/link";
import { Suspense, useState, useSyncExternalStore, type FormEvent } from "react";
import { cartOrderLines, type CartSelection } from "@/lib/cart";
import { isValidDeliveryDate, subscribeIndiaDate, todayInIndia } from "@/lib/delivery";
import { getCollection, SIZE_NAMES, sizePrice, type Product, type SizeKey } from "@/lib/products";
import { addOns, deliverySlots, site, type DeliverySlot } from "@/lib/site";
import { buildOrderMessage, formatPrice, waLink } from "@/lib/whatsapp";
import { AddOns } from "./AddOns";
import { useCart } from "./CartProvider";
import { DeliveryPicker } from "./DeliveryPicker";
import { CartIcon, LeafIcon, WhatsAppIcon } from "./Icons";
import { InfoTabs } from "./InfoTabs";
import { ProductPhoto } from "./ProductPhoto";
import { SizeFromUrl } from "./SizeFromUrl";
import { SizePicker } from "./SizePicker";
import "./ProductDetails.css";

const serverDate = () => "";

export function ProductDetails({ product }: { product: Product }) {
  const { add } = useCart();
  const today = useSyncExternalStore(subscribeIndiaDate, todayInIndia, serverDate);
  const [size, setSize] = useState<SizeKey>("M");
  const [chosenAddOns, setChosenAddOns] = useState<string[]>(addOns.some((item) => item.id === "card") ? ["card"] : []);
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState<DeliverySlot>(deliverySlots[0]);
  const [cardMessage, setCardMessage] = useState("");
  const [qty, setQty] = useState(1);
  const [error, setError] = useState("");
  const [added, setAdded] = useState("");
  const collection = getCollection(product.collection);
  const selection: CartSelection = {
    slug: product.slug,
    size: product.sizes ? size : null,
    addOns: chosenAddOns,
    ...(isValidDeliveryDate(date) ? { delivery: { date, slot } } : {}),
    ...(chosenAddOns.includes("card") && cardMessage.trim() ? { cardMessage: cardMessage.trim() } : {}),
  };
  const orderLines = cartOrderLines([{ ...selection, qty }]);
  const total = orderLines.reduce((sum, line) => sum + line.unitPrice * line.qty, 0);
  const hasUnpricedAddOns = orderLines.some((line) => line.hasUnpricedAddOns);
  const basePrice = product.sizes ? sizePrice(product.sizes, size) : product.price;
  const titleWords = product.name.split(" ");

  function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAdded("");
    if (!isValidDeliveryDate(date, todayInIndia())) {
      setError(date ? "Choose today or a future delivery date." : "Choose a delivery date.");
      event.currentTarget.querySelector<HTMLInputElement>('[name="delivery-date"]')?.focus();
      return;
    }
    setError("");
    const action = (event.nativeEvent as SubmitEvent).submitter?.getAttribute("value");
    if (action === "whatsapp") {
      window.open(waLink(buildOrderMessage(orderLines)), "_blank", "noopener,noreferrer");
    } else {
      add(selection, qty);
      setAdded(`Added ${qty} ${qty === 1 ? "item" : "items"} to your cart.`);
    }
  }

  return (
    <>
      <nav className="gl-detail-breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link><span aria-hidden="true"> / </span>
        <Link href={`/catalog?c=${product.collection}`}>{collection?.name ?? "Shop"}</Link><span aria-hidden="true"> / </span>
        <span aria-current="page">{product.name}</span>
      </nav>
      {product.sizes && <Suspense fallback={null}><SizeFromUrl sizes={product.sizes} onSize={setSize} /></Suspense>}
      <section className="gl-detail-main" aria-labelledby="product-heading">
        <ProductPhoto product={product} size={product.sizes ? size : null} />
        <div className="gl-detail-panel">
          <div className="gl-detail-intro">
            <p className="gl-detail-collection">{collection?.name}</p>
            <h1 id="product-heading">{titleWords.slice(0, -2).join(" ")} <em>{titleWords.slice(-2).join(" ")}</em></h1>
            <div className="gl-detail-divider" aria-hidden="true"><span /><LeafIcon size={14} /><span /></div>
            <div className="gl-detail-price-row" aria-live="polite" aria-atomic="true">
              <p className="gl-detail-price">{formatPrice(basePrice)}</p>
              <span>{product.sizes ? `${SIZE_NAMES[size]} size · ` : ""}incl. taxes</span>
            </div>
            <p className="gl-detail-description">{product.description}</p>
          </div>

          <form className="gl-detail-form" onSubmit={submitOrder} noValidate>
            {product.sizes && <SizePicker sizes={product.sizes} value={size} onChange={(next) => { setSize(next); setAdded(""); }} />}
            <AddOns value={chosenAddOns} onChange={(next) => { setChosenAddOns(next); setAdded(""); }} />
            <DeliveryPicker
              date={date} slot={slot} cardMessage={cardMessage} cardEnabled={chosenAddOns.includes("card")}
              minDate={today} error={error}
              onDateChange={(next) => { setDate(next); setError(""); setAdded(""); }}
              onSlotChange={(next) => { setSlot(next); setAdded(""); }}
              onMessageChange={(next) => { setCardMessage(next); setAdded(""); }}
            />
            <div className="gl-detail-order-summary">
              <div className="gl-detail-quantity" role="group" aria-label="Quantity">
                <button type="button" aria-label="Decrease quantity" disabled={qty === 1} onClick={() => { setQty(qty - 1); setAdded(""); }}>−</button>
                <output aria-live="polite" aria-label="Quantity">{qty}</output>
                <button type="button" aria-label="Increase quantity" disabled={qty === 20} onClick={() => { setQty(qty + 1); setAdded(""); }}>+</button>
              </div>
              <p className="gl-detail-total" aria-live="polite" aria-atomic="true"><span>Total</span> <strong>{formatPrice(total)}</strong>{hasUnpricedAddOns && <small>+ add-ons to confirm</small>}</p>
            </div>
            <div className="gl-detail-actions">
              <button type="submit" name="action" value="add" className="gl-detail-add"><CartIcon size={18} />Add to cart</button>
              <button type="submit" name="action" value="whatsapp" className="gl-detail-whatsapp"><WhatsAppIcon size={18} stroke="#D9BE84" />Order on WhatsApp</button>
            </div>
            <p className="gl-detail-added" role="status" aria-live="polite">{added}</p>
          </form>
          <a href={`tel:${site.phoneTel}`} className="gl-detail-call">Prefer to call? {site.phoneDisplay}</a>
          <InfoTabs product={product} />
        </div>
      </section>
    </>
  );
}
