# GLONIA Flowers & Perfumes — website build spec

You are building the real website for **GLONIA Flowers & Perfumes**, a flower shop that sells Korean bouquets, flower boxes and custom work, with perfumes coming soon. Customers order on **WhatsApp**. There is no payment gateway and no backend.

This file is the source of truth. The approved design is in `design-reference/`. Match it closely.

---

## 1. Stack (do not change without asking)

- Next.js (App Router) + TypeScript
- Tailwind CSS (design tokens below go in `tailwind.config.ts` and CSS variables)
- `next/font/google` for fonts, `next/image` for every image
- Static site: `output: 'export'` in `next.config.ts` (set `images.unoptimized: true`)
- Product data from `data/*.json`, synced from **Sanity** at build time (`scripts/sync-sanity.mjs`, runs as `prebuild`). Studio lives in `studio/` (separate package, see `studio/README.md`). No database, no API routes, no runtime CMS fetches
- Cart state: React context + `localStorage` (wrapped in try/catch)
- Deploy target: Vercel (or any static host)
- No extra UI libraries. No animation libraries — CSS keyframes only

## 2. Folder layout to create

```
app/
  layout.tsx            fonts, TopBar, Header, Footer, CartProvider
  page.tsx              Home
  catalog/page.tsx      Catalog (reads ?c=<collection> for filter)
  product/[slug]/page.tsx  Product details (generateStaticParams from products.json)
  globals.css           tokens, keyframes (.gl-shine, .gl-tw, .gl-float, sway)
components/             TopBar, Header, Footer, Hero, CollectionsBento, FavouritePicks,
                        SizeReference, OurWork, HowToOrder, PerfumeTeaser, Gallery,
                        ProductCard, CartBar, CustomOrderCard, SizePicker, AddOns,
                        DeliveryPicker, InfoTabs, FloralCorner, Sparkles
lib/
  site.ts               phone, email, hours, address (single place for contact info)
  whatsapp.ts           build wa.me links + messages
  hours.ts              isOpenNow() for the top bar
  products.ts           typed loaders for data/*.json
data/                   products.json, collections.json, settings.json (written by the Sanity sync; committed as fallback)
studio/                 Sanity Studio (schemas, seed script) — own package.json
public/images/          all images (already provided)
design-reference/       approved design markup (read-only, do not ship)
```

## 3. Design tokens

**Colours**
| Token | Hex | Use |
|---|---|---|
| ink | `#1A1A1A` | text, black buttons |
| white | `#FFFFFF` | page background |
| gold-500 | `#B8913F` | lines, frames, icons |
| gold-400 | `#C9A85C` | shimmer, accents |
| gold-300 | `#D9BE84` | soft lines |
| gold-200 | `#E6CF93` | highlights |
| gold-text | `#8A6A26` | small gold text on white (readable) |
| champagne | `#F7F3EC` | section backgrounds, footer |
| champagne-2 | `#F6F0E6` | cards |
| line | `#E8DFCC` | borders |
| muted | `#625B52` | body text secondary |
| blush | `#F7EEE8` | product photo stage |
| blush-2 | `#F8ECE7` | perfume section |
| sage | (see `.gl-invite` in home-desktop.html) | wedding invitation card |

**Fonts**
- Bodoni Moda (400/500, italic) — big headings
- Cinzel (500/600) — small caps labels, nav, buttons
- Great Vibes — script accents only (one or two words, never body)
- Manrope (400–700) — body text, 16px, line-height 1.6

**Shapes**: square corners on buttons (black fill, white Cinzel text, letter-spacing). Thin gold 1px lines. Double gold frames with small diamond corners in the hero.

**Motion** (all must stop under `prefers-reduced-motion: reduce`)
- `.gl-shine` — gold gradient text shimmer
- `.gl-tw` — twinkling gold sparkles
- `.gl-float` — slow floating petals
- sway — slow rotate on floral corners
- Copy the exact keyframes from `design-reference/home-desktop.html`.

## 4. Global pieces

**TopBar (ticker)** — thin scrolling strip on every page. Shows shop hours **8:30 AM – 7:30 PM** (from Site settings) and a live status: "Open now — we reply in minutes" or "Closed now — message us, we reply first thing in the morning". Uses `lib/hours.ts` with India time (Asia/Kolkata).

**Header** — nav left (Shop now, Collections, Gifts, etc. — see reference), **logo centred** (`/images/logo.png`), "Order on WhatsApp" button right, cart icon with count. Mobile: hamburger + logo + cart.

**Footer** — light champagne background (NOT dark). Logo, short line, three cards: Contact (phone, email, WhatsApp), Visit (address placeholder), Shop (links). Small copyright row.

## 5. Pages

### Home (`design-reference/home-desktop.html`, `home-mobile.html`)
1. **Hero** — double gold frame with diamond corners, 4 floral corners (one image `floral-corner-tl.jpg` mirrored with `scaleX(-1)` / `scaleY(-1)`, soft gradient mask, `mix-blend-mode: multiply`), sparkles. Centre: **only the logo** (`width: clamp(240px, 26vw, 360px)`; mobile 230px), gold leaf divider, short description, two buttons, three arched photos. No flower graphic behind the logo.
2. **Collections bento** — grid of collection tiles + sage "Weddings & events" invitation-style card.
3. **Favourite picks** — row of collection titles that auto-slides, **3 titles visible, middle one active**. Every ~3s it moves one step (loop forever, pause on hover/focus, arrows to move by hand). When the active title changes, the **4 product cards below change** to that collection. If a collection has no products yet, show a "Coming soon — ask us on WhatsApp" card. Order = `collections.json` order. Mobile: same 3-title slider, product cards in a swipe row.
4. **Size reference** — one box photo with measure lines: Small 5.5", Medium 6.5", Large 7.5", Extra Large 9". No prices.
5. **Our work** — photo grid.
6. **How to order** — 4 steps: 1 Pick your flowers · 2 Choose date & time ("Pick your delivery date and time.") · 3 Order on WhatsApp · 4 We deliver fresh, on time. No "Enquire for an event" button.
7. **Perfumes coming soon** — blush background, `perfume-bottle.webp`, "Notify me on WhatsApp" button (prefilled message).
8. **Gallery**.

### Catalog (`catalog-desktop.html`, `catalog-mobile.html`)
- Collection bubbles (filter), price filter chips, sort (featured / price low–high / high–low).
- Product cards: image, name, price, and the **S · M · L (· XL) badge on the photo is the size selector** (when sizes exist; price follows the selected size, default S) and **Buy now**. No add-to-cart on cards.
  - Buy now → product details page with the selected size (same as photo / name), so date, slot and add-ons are always chosen before WhatsApp.
  - Photo / name → product details page with the selected size (`/product/<slug>?size=L`); items are added to the cart there, after choosing date, slot and add-ons. The sticky **cart bar** (count + total + "Checkout on WhatsApp") shows whenever the cart has items.
- "Made just for you" custom-order card (light, not dark) → WhatsApp.
- Cart page has an "Add a gift" button → `/catalog?c=gifts`.
- Start with an **empty** cart (the design shows one item only for preview).

### Product details (`product-desktop.html`, `product-mobile.html`)
- Blush photo stage with an offset gold outline, **one image only** (no thumbnails), badges: "Fresh on delivery day", "S · M · L" ("S – XL" when XL is offered), size card "{size} · {inches}".
- Name, price (updates with size), short description, trust tiles.
- **Size picker S / M / L / XL** (only when `sizes` is not null; XL only when the product has an XL price) — shows inches 5.5 / 6.5 / 7.5 / 9.
- **Add-ons** (checkboxes; prices are placeholders). No gift add-on: gifts are a product collection.
- **Delivery date** (date input, no past dates) + **time slot** select: one-hour slots from 9–10 AM to 7–8 PM (11 slots). No pincode field.
- Buttons: Add to cart, Order on WhatsApp.
- Info tabs (Details, Care, Delivery), size guide circles, related products (same collection).

## 6. WhatsApp ordering (`lib/whatsapp.ts`)

Number: **916238823455**. Link: `https://wa.me/916238823455?text=<encodeURIComponent(msg)>`. Open in a new tab.

Message format (plain text, keep it short):
```
Hi GLONIA, I'd like to order:
* Peach & White Blooming Box
* Link: https://<site>/product/peach-white-blooming-box?size=M
* Size M — ₹4,300
* Add-ons: Nil
* Chocolates: Nil
* Message card: xyzzx

Customization (optional):
Delivery Date: 19 Oct 2026
Delivery Time: 5–6 PM

Receiver Name:
Receiver Number:
Delivery Location (map link/ address):
```
Cart checkout repeats the item block (with its own customization and delivery date/time) for every line item and adds a `Total:` line before the receiver details. Fields the site doesn't know are left blank for the customer to fill. Format prices with `toLocaleString('en-IN')`.

## 7. Data model

`data/products.json` — `slug, name, collection, alsoIn[], price, sizes ({S,M,L,XL?} | null), image, description`. XL is optional per product.
A product appears in its `collection` and every id in `alsoIn`.
`data/collections.json` — `id, name, order`. Only korean, red, classic, bloom have products right now.

## 8. Placeholders (listed in `lib/site.ts` with `// TODO client`; values live in Sanity Site settings / `data/settings.json`)
- Shop address and city
- Instagram handle
- Add-on names and prices
- Photos for: premium, custom, choco, bridal, car, gifts collections
- Higher-resolution product photos (current ones are crops from the catalogue)

Known real details: email **Gloniadesigns@gmail.com**, phone **+91 62388 23455**.

## 9. Rules
- Mobile-first. Test at 390px, 768px, 1440px. No horizontal scroll.
- Accessibility: alt text on every image, real `<button>`/`<a>`, visible focus ring (gold), colour contrast — use `gold-text` (#8A6A26) for small gold text on white, never #C9A85C.
- Respect `prefers-reduced-motion` (stop ticker, slider auto-play, shimmer, sway, float).
- SEO: per-page `metadata`, Open Graph image, `LocalBusiness` (Florist) JSON-LD in layout.
- Lighthouse target: 90+ on all four scores on mobile.
- Keep components small. No dead code. No `any`.
- Do not invent new sections or colours. If the design and this file disagree, this file wins; if unsure, ask.

## 10. Done when
- [ ] All 3 pages match the reference on desktop and mobile
- [ ] Favourite picks slider changes the 4 products with the active title
- [ ] Top bar shows correct open/closed status in India time
- [ ] Add to cart, cart bar, Buy now and checkout all open WhatsApp with the right message
- [ ] Size / add-on / date / slot on product page flow into the WhatsApp message
- [ ] `npm run build` passes with no type or lint errors, static export works
- [ ] Reduced motion and keyboard navigation work
- [ ] All TODO placeholders listed in one place (`lib/site.ts`)
