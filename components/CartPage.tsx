"use client";

import Image from "next/image";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { cartLineKey, cartOrderLines, type CartItem } from "@/lib/cart";
import { getCollection, getProduct, getProductsIn, SIZE_INCHES, SIZE_NAMES } from "@/lib/products";
import { site } from "@/lib/site";
import { addOnLabel, formatDeliveryDate, formatPrice, waLink } from "@/lib/whatsapp";
import { CartCheckout } from "./CartCheckout";
import { useCart } from "./CartProvider";
import { CatalogDecoration } from "./Catalog";
import { CartIcon, CloseIcon, WhatsAppIcon } from "./Icons";
import { ProductRow } from "./RelatedProducts";
import "./CartPage.css";

const noop = () => () => {};

function CartLine({ item }: { item: CartItem }) {
  const { setQty } = useCart();
  const product = getProduct(item.slug);
  const [line] = cartOrderLines([item]);
  if (!product || !line) return null;
  const key = cartLineKey(item);
  const href = `/product/${product.slug}`;

  return (
    <li className="gl-cartp-line">
      <Link href={href} prefetch={false} className="gl-cartp-photo" tabIndex={-1} aria-hidden="true">
        <Image src={product.image} alt="" fill sizes="(min-width: 861px) 140px, 96px" />
      </Link>
      <div className="gl-cartp-info">
        <p className="gl-cartp-collection">{getCollection(product.collection)?.name}</p>
        <h3 className="gl-cartp-name"><Link href={href} prefetch={false}>{product.name}</Link></h3>
        <dl className="gl-cartp-meta">
          {item.size && <div><dt>Size</dt><dd>{SIZE_NAMES[item.size]} ({item.size}) · {SIZE_INCHES[item.size]}</dd></div>}
          {line.addOns.length > 0 && <div><dt>Add-ons</dt><dd>{line.addOns.map(addOnLabel).join(", ")}</dd></div>}
          {item.delivery && <div><dt>Delivery</dt><dd>{formatDeliveryDate(item.delivery.date)}{item.delivery.slot ? `, ${item.delivery.slot}` : ""}</dd></div>}
          {item.cardMessage && <div><dt>Card</dt><dd className="gl-cartp-card">“{item.cardMessage}”</dd></div>}
        </dl>
        <p className="gl-cartp-each">{formatPrice(line.unitPrice)} each</p>
      </div>
      <div className="gl-cartp-controls">
        <div className="gl-cartp-qty" role="group" aria-label={`Quantity of ${product.name}`}>
          <button type="button" onClick={() => setQty(key, item.qty - 1)} disabled={item.qty <= 1} aria-label={`One less ${product.name}`}>−</button>
          <output aria-live="polite">{item.qty}</output>
          <button type="button" onClick={() => setQty(key, item.qty + 1)} aria-label={`One more ${product.name}`}>+</button>
        </div>
        <p className="gl-cartp-line-total">{formatPrice(line.unitPrice * line.qty)}</p>
        <button type="button" className="gl-cartp-remove" onClick={() => setQty(key, 0)} aria-label={`Remove ${product.name} from cart`}>
          <CloseIcon size={12} />Remove
        </button>
      </div>
    </li>
  );
}

/** Gifts to add alongside the flowers, skipping ones already in the cart. Hidden until the Gifts collection has products. */
function GiftSuggestions({ items }: { items: CartItem[] }) {
  const { add } = useCart();
  const gifts = getProductsIn("gifts").filter((gift) => !items.some((item) => item.slug === gift.slug)).slice(0, 12);
  // A gift goes out with the first item in the cart: same delivery date and time.
  const delivery = items[0]?.delivery;
  return (
    <ProductRow
      headingId="cart-gifts-heading"
      accent="Make it a gift"
      title={<>You may also like to <span>add</span></>}
      label="Gifts"
      products={gifts}
      more={{ href: "/catalog?c=gifts", label: "View all gifts" }}
      scroll
      action={(gift) => (
        <button
          type="button"
          className="gl-related-products-add"
          aria-label={`Add ${gift.name} to cart`}
          onClick={() => add({ slug: gift.slug, size: gift.sizes ? "S" : null, addOns: [], ...(delivery ? { delivery } : {}) })}
        >
          <CartIcon size={15} />Add to cart
        </button>
      )}
    />
  );
}

function EmptyCart() {
  return (
    <div className="gl-cartp-empty">
      <p className="gl-cartp-empty-accent">Nothing here yet</p>
      <h2>Your cart is empty</h2>
      <p>Pick a bouquet or flower box you love — you can review it here before ordering on WhatsApp.</p>
      <div className="gl-cartp-empty-actions">
        <Link href="/catalog" prefetch={false} className="gl-cartp-button">Shop flowers</Link>
        <a href={waLink()} target="_blank" rel="noopener noreferrer" className="gl-cartp-button gl-cartp-button-light">
          <WhatsAppIcon size={15} />Ask on WhatsApp
        </a>
      </div>
    </div>
  );
}

function Summary() {
  const { count, total, hasUnpricedAddOns, clear } = useCart();
  return (
    <aside className="gl-cartp-summary" aria-labelledby="cart-summary-heading">
      <h2 id="cart-summary-heading">Order summary</h2>
      <dl className="gl-cartp-rows">
        <div><dt>Items</dt><dd>{count}</dd></div>
        {hasUnpricedAddOns && <div><dt>Add-ons</dt><dd>Price to confirm</dd></div>}
        <div><dt>Delivery</dt><dd>Confirm on WhatsApp</dd></div>
        <div className="gl-cartp-total" role="status" aria-live="polite" aria-atomic="true">
          <dt>Total</dt><dd>{formatPrice(total)}{hasUnpricedAddOns ? " +" : ""}</dd>
        </div>
      </dl>
      <CartCheckout
        className="gl-cartp-button gl-cartp-checkout"
        warningId="cart-page-delivery-warning"
        renderWarning={(id) => (
          <p id={id} role="status" className="gl-cartp-warning">
            A delivery date has passed. Remove that item and add it again with a new date.
          </p>
        )}
      >
        <WhatsAppIcon size={16} stroke="#D9BE84" />Checkout on WhatsApp
      </CartCheckout>
      <p className="gl-cartp-note">We confirm availability, delivery and your address on WhatsApp. Quick replies · {site.hours.label}.</p>
      <div className="gl-cartp-summary-links">
        <Link href="/catalog" prefetch={false}>Continue shopping</Link>
        <button type="button" onClick={clear}>Clear cart</button>
      </div>
    </aside>
  );
}

export function CartPage() {
  const { items, count } = useCart();
  // The cart lives in localStorage; avoid flashing "empty" before it is read.
  const hydrated = useSyncExternalStore(noop, () => true, () => false);

  return (
    <div className="gl-cartp">
      <section className="gl-catalog-header" aria-labelledby="cart-heading">
        <div className="gl-catalog-title-region">
          <CatalogDecoration />
          <div className="gl-catalog-title-content gl-cartp-title">
            <nav className="gl-catalog-breadcrumb" aria-label="Breadcrumb">
              <Link href="/">Home</Link><span aria-hidden="true"> / </span>
              <Link href="/catalog">Shop</Link><span aria-hidden="true"> / </span>
              <span aria-current="page">Cart</span>
            </nav>
            <p className="gl-catalog-accent">Your selection</p>
            <h1 id="cart-heading">Your <em>cart</em></h1>
            <p className="gl-catalog-shade">
              {hydrated && count > 0 ? `${count} ${count === 1 ? "item" : "items"} · order on WhatsApp` : "Order on WhatsApp, no online payment"}
            </p>
          </div>
        </div>
      </section>

      <div className="gl-cartp-body">
        {!hydrated ? (
          <p className="gl-cartp-loading">Loading your cart…</p>
        ) : items.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="gl-cartp-layout">
            <section aria-labelledby="cart-items-heading" className="gl-cartp-items">
              <h2 id="cart-items-heading" className="gl-cartp-items-heading">Items</h2>
              <ul>
                {items.map((item) => <CartLine key={cartLineKey(item)} item={item} />)}
              </ul>
            </section>
            <Summary />
          </div>
        )}
      </div>
      {hydrated && items.length > 0 && <GiftSuggestions items={items} />}
    </div>
  );
}
