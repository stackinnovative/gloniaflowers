# GLONIA — Sanity CMS

Products, collections and site settings are edited in Sanity Studio. The website stays a static site: every build pulls the published content from Sanity into `data/*.json` (`scripts/sync-sanity.mjs`), so a change goes live after the next deploy (about 1–2 minutes with the webhook below).

If Sanity is not configured, the build uses the JSON already in `data/`, so the site still builds.

## One-time setup

1. **Create the project.** Sign in at <https://www.sanity.io/manage> → *Create project* (dataset `production`, **public**). Copy the project id.
2. **Configure the Studio.**
   ```bash
   cd studio
   cp .env.example .env        # set SANITY_STUDIO_PROJECT_ID
   npm install
   npx sanity login
   ```
3. **Import the current catalogue** (12 products, 10 collections with tile photos, site settings). It's safe to re-run, because it overwrites the same documents:
   ```bash
   npm run seed
   ```
4. **Publish the Studio** for the shop owner: `npm run deploy` → `https://glonia.sanity.studio` (change `studioHost` in `sanity.cli.ts` first if that name is taken). Invite the owner under *Manage → Members* (Editor role).
5. **Connect the website.** In the site root, copy `.env.example` to `.env.local` and set `SANITY_PROJECT_ID`. Add the same variables in Vercel → *Project → Settings → Environment Variables*. Run `npm run sync` to check that it pulls the content.
6. **Auto-deploy on publish.**
   - Vercel → *Project → Settings → Git → Deploy Hooks* → create a hook (branch `main`) and copy the URL.
   - Sanity → *Manage → API → Webhooks* → *Create*: paste the URL, dataset `production`, trigger on create/update/delete, filter `_type in ["product", "collection", "siteSettings"]`, HTTP method `POST`.
7. **CORS** (only for local Studio on another port): *Manage → API → CORS origins* → add `http://localhost:3333`.

A private dataset also works. Create a *Viewer* token under *API → Tokens* and set `SANITY_API_TOKEN` on the website side.

## Editing rules (for the shop owner)

- **Publish** to send a change to the site. Drafts never appear.
- **Link** and **Link id** become the page addresses. Don't change them after launch, because shared links would stop working.
- **Comes in S / M / L** switches between one price and three size prices. The Small price is shown as "from ₹…".
- **Order:** lower numbers show first. Products use steps of 10, so a new product can go in between (e.g. 15).
- If something required is missing, the website build stops and keeps the last good version live. The deploy log lists what to fix.

## Site settings

One document, at the bottom of the Studio menu:

- **Contact:** tagline, shop description, WhatsApp number (every order goes here), phone, email, address, Instagram.
- **Hours & delivery:** opening hours, which drive the "Open now / Closed now" strip, and the same-day cut-off. The four delivery time slots stay fixed at 9 AM – 9 PM in code.
- **Add-ons:** name, id and price. Leave the price empty for "Price to confirm"; 0 shows "Free". Don't change an add-on's id after launch, because carts already saved in customers' browsers use it.
- **Home page photos:** the three hero arches (the middle one is the centrepiece), the WhatsApp example, the size-reference box, the custom-order card photos and the gallery.

Products picked here can't be deleted while they're in use; Sanity asks you to swap them out first. Collection tile photos are on each **Collection**.

## Still in code

The site address (`site.url` in `lib/site.ts`, currently gloniaflowers.vercel.app), delivery time slots, page wording, and the "Our work" placeholder labels shown until the Bridal / Car Décor / Customized collections get a photo.
