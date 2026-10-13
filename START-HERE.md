# Start here — build GLONIA with Claude Code in VS Code

## What is in this folder
- `CLAUDE.md` — the full build spec. Claude Code reads it automatically.
- `design-reference/` — the approved design markup for all 6 screens. These files use the design-canvas runtime, so they will not open as normal web pages. Claude Code reads them for exact layout, text, spacing and CSS. For the visual, use the live canvas link.
- `data/` — products and collections.
- `public/images/` — logo, floral corners, perfume photo, 12 product photos.

## Setup (10 minutes)
1. Install Node.js 20+ and VS Code. Install the **Claude Code** extension in VS Code (or run `npm i -g @anthropic-ai/claude-code`).
2. Unzip this folder. Rename it to `glonia-site`. Open it in VS Code.
3. Run `git init && git add . && git commit -m "handoff"` so you can undo anything.
4. Open Claude Code in VS Code.

## First prompt (paste as is)
```
Read CLAUDE.md fully, then read every file in design-reference/ and data/.
Create a Next.js App Router + TypeScript + Tailwind project in THIS folder
(keep data/, public/, design-reference/ and CLAUDE.md as they are).
Step 1 only: set up the project, design tokens, fonts, globals.css keyframes,
lib/ files, TopBar, Header and Footer, and an empty Home page.
Show me the plan first, then build. Run `npm run build` at the end and fix errors.
```

## Then go step by step (one prompt each, check in the browser after each)
2. "Build the Home page hero, collections bento and how-to-order sections from home-desktop.html and home-mobile.html."
3. "Build Favourite picks with the 3-title auto slider that changes the 4 products."
4. "Build size reference, our work, perfume coming soon and gallery."
5. "Build the Catalog page with filters, sort, cart context, cart bar and WhatsApp checkout."
6. "Build the Product page with size, add-ons, date and time slot, and the WhatsApp message."
7. "Go through the 'Done when' checklist in CLAUDE.md. Test at 390px and 1440px. Fix every gap."
8. "Deploy: set up for Vercel static export."

Run `npm run dev` and keep http://localhost:3000 open while you work.

## Tips
- One section per prompt. Big prompts give sloppy results.
- Commit after every step that works.
- If something looks off, send Claude Code a screenshot and name the reference file.
- Before launch, fill every `TODO client` in `lib/site.ts`.
