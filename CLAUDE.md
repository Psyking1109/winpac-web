# WINPAC website — project brief for Claude Code

Public product-catalogue website for **WINPAC Trading Company** (Colombo, Sri Lanka, est. 1988): abrasives, machines,
stone-care chemicals and natural stone aggregates for granite & marble factories, flooring contractors and restorers.
Owner: Niland. Live on Railway; code on GitHub (`Psyking1109/winpac-web`, branch `main`).

## Stack
- **Front end:** Vue 3 + Vue Router + Pinia, built with Vite (`client/`). Plain CSS (`client/src/styles/site.css` base, `app.css` additions). Light/dark toggle (`data-theme` on `<html>`, saved in localStorage, set early by `client/public/theme-init.js`).
- **Back end:** Node.js ≥ 22.13 + Express (`server/index.js`). No native deps.
- **Database:** SQLite via Node's built-in `node:sqlite` (`server/db.js`). One file: `data/winpac.db`. Uploads in `data/uploads/`.
  Records are stored as validated JSON per collection (`items` table: col, slug, ord, data). Field whitelists live in `SPEC`/`COMPANY` in `db.js` — **add a field there or it will be silently dropped**.
- **Auth:** single admin role. bcrypt hashes, JWT in HttpOnly SameSite=Strict cookie (12 h). Mutating API calls must send header `X-Requested-With: winpac`. Login rate-limited.

## Commands
```
npm install
npm run dev            # API on :8080 + Vite on :5173 (proxy)
npm run build          # builds client/dist (served by Express)
npm start              # production server
npm run build:preview  # one-file offline preview -> client/dist-preview/index.html (mock API in browser)
npm run create-admin -- <user> <password>
npm run backup
```

## Layout
```
client/src/pages/            Public pages (Home, Products, Range, Brands, Brand, Product, Solutions, Solution, About, Contact)
client/src/pages/admin/      Admin (sign-in, products w/ photo upload, brands w/ logos, list editor, company details)
client/src/components/       Header (+ range bar, theme toggle), footer (+ hidden staff lock), cards, grit band, etc.
client/src/stores.js         site data, auth, enquiry list (localStorage), ui/theme
client/src/preview/          mock API + data.json for the offline preview only
server/index.js              API, uploads (multer, magic-byte checked), static SPA
server/db.js                 SQLite layer + field rules
server/seed*.js(on)          starter content — see "Seeding" below
server/seed-assets/          starter logos, product photos, client logos, grit image
```

## Data model
Collections: `groups` (= "Ranges" shown in the teal bar: machines, abrasives, chemicals, stones), `categories` (sub-sections
shown as tabs on a range page; each has `group`), `purposes` ("Used for" tags), `audiences` ("Solutions"), `brands`, `products`.
Settings row `site`: `company` (contacts, texts, timeline, chemItems, clients[{name,logo}], logo…) and `assets.grit`.
Products: slug, name, brand (slug or "" = WINPAC/no brand), category, origin, purposes[], summary, description, features[], specs[{label,value}], images[] (≤4 in UI), featured.

## Seeding — IMPORTANT
The live database already exists, so editing original seed files does **not** change the live site. Starter content is applied
by one-time "packs", each guarded by a meta key in the settings table (`DB.getMeta/setMeta`):
- `seed-data.json` (only when DB empty), `seed-products*.json` (PACKS list in `seed.js`), `seed-photos.json` (fills empty `images`),
  `seed-clients.json`, `seed-categories-2.json` (sub-sections; moves only products still in their original category).
- **To add content for the live site: create a NEW pack file + a NEW meta key.** Never edit an already-applied pack expecting it to rerun.
  Packs must never overwrite things the owner edited in the admin.
- `seed-assets/` is copied into `uploads/seed/` on every start (safe; admin uploads live in `uploads/` root).
- `ADMIN_USERNAME`/`ADMIN_PASSWORD` env vars are authoritative: created or re-hashed on every start (password ≥ 10 chars).
- Keep `server/build-preview-data.js` in sync when adding packs so the preview matches.

## Deployment (Railway)
- Builds from `Dockerfile` (multi-stage, `node:22-alpine`). Service settings: **Root Directory empty**, branch `main`, Wait for CI off.
- Volume mounted at **`/app/data`** (holds DB + uploads — never lose it).
- Variables: `JWT_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `TRUST_PROXY=1`, `RAILWAY_RUN_UID=0`. Port 8080. App sleeping enabled (free plan).
- Auto-deploy depends on the Railway GitHub App having access to the repo (it broke once: "Could not load branches").
- Alternative hosting docs (Docker + Caddy, Oracle) are in README.md / docker-compose.yml.

## Owner's content rules (do not regress)
- Standalone WINPAC site: **no Stone Tech / joint-venture content**, no Stone Tech logo.
- **No Maldives** mentions. **No WhatsApp** buttons (contact = phone + email only). Don't use "Engineering Simplified".
- 2018 milestone wording: "Started providing customised chemical solutions" (not "manufacturing chemicals").
- Mobile: **+94 773447041**. Office: +94 11 2438429 / +94 11 2438283 (each rendered as its own tel: link via `phoneList`). Email winpactc@gmail.com. Address 34 Central Road, Colombo 12.
- Brands: Surie Polex, CUMI, High Tech Grinding, Abrasivos Aguila, Abtex, Künzle & Tasin. WINPAC is **not** listed as a brand.
- Top bar = ranges (Machines, Abrasives, Chemicals, Stones). Aggregates = chips/pebbles from India, Sri Lanka, Vietnam (**not boulders**).
- Admin entry = faint lock icon bottom-right of footer (no Admin link in the menu).
- Product copy from manufacturer pages must be **rewritten in WINPAC's own words** (specs/facts may be reused). Flag anything guessed.
- Grit strip labels: 50, 100, 200, 400, 800, 1500, 3000. Brand palette: teal #036065, gold #B8964A, cream background.

## Open items / ideas
- No photos yet: both vacuums, Densi-Hard Lithium & Sodium, R1 Diamond Fickert Brushes, 8" Buff Plate, Surie Polex Cleaning Pads.
- To verify with owner: Metal Fickert 140 uses a photo of the 170 model; "dcrmra" photo assumed = 8" Resin Bond Diamond Plate;
  5-step pad order (site uses manufacturer's: Fine Grinding → Smooth Grinding → Pre-Polish → Polish → Polish);
  Stornello / HTG tools have generic descriptions; an unassigned photo of colourful hand diamond pads exists.
- Not yet built: admin upload for the grit image; a "Download backup" button in admin.

## Working conventions
- Owner is non-technical and works on a Mac with VS Code; explain steps plainly, avoid jargon.
- After changes: `npm run build` must pass; test public pages, admin login, adding a product with photos, and dark mode.
- Never commit `data/`, `.env`, `node_modules/`, `client/dist-preview/`.
