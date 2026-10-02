"use strict";
// Fills an empty database with WINPAC's company details, ranges, categories and brands.
// Runs automatically on first start.
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const DB = require("./db");
const DATA = require("./seed-data.json");

// Copies the starting logos and photos into uploads/seed (refreshed on every start).
function copyAssets(uploadDir) {
  const walk = (src, dest) => {
    fs.mkdirSync(dest, { recursive: true });
    for (const f of fs.readdirSync(src)) {
      const s = path.join(src, f), d = path.join(dest, f);
      if (fs.statSync(s).isDirectory()) walk(s, d); else fs.copyFileSync(s, d);
    }
  };
  walk(path.join(__dirname, "seed-assets"), path.join(uploadDir, "seed"));
}
function seedIfEmpty(uploadDir) {
  copyAssets(uploadDir);
  if (!DB.isEmpty()) return false;
  DB.seed(DATA);
  console.log("New database: added WINPAC company details, ranges, categories and brands.");
  return true;
}
// Adds each product pack once. Products you later edit or delete are left alone.
const PACKS = [["products-2026-10", "seed-products.json"], ["products-2026-10b", "seed-products-2.json"], ["products-2026-10c", "seed-products-3.json"], ["products-2026-10d", "seed-products-4.json"]];
function seedProducts() {
  let added = 0;
  for (const [key, file] of PACKS) {
    if (DB.getMeta(key)) continue;
    for (const p of require("./" + file)) if (!DB.slugExists("products", p.slug)) { DB.create("products", p); added++; }
    DB.setMeta(key, { added: new Date().toISOString() });
  }
  if (added) console.log(`Added ${added} products to the catalogue.`);
}
// Puts the supplied photos on products that have none yet, and adds client logos once.
function seedPhotosAndClients() {
  if (!DB.getMeta("photos-2026-10")) {
    const photos = require("./seed-photos.json"); let n = 0;
    for (const p of DB.list("products")) if (photos[p.slug] && !(p.images || []).length) { DB.update("products", p._id, { images: photos[p.slug] }); n++; }
    DB.setMeta("photos-2026-10", { added: n });
    if (n) console.log(`Added photos to ${n} products.`);
  }
  if (!DB.getMeta("clients-2026-10")) {
    const st = DB.getSettings();
    if (st && !(st.company.clients || []).length) DB.saveSettings({ company: { clients: require("./seed-clients.json") } });
    DB.setMeta("clients-2026-10", { added: true });
  }
}
// Splits Chemicals and Machines into sub-sections, once. Only products still in their
// original category are moved, so anything you have re-arranged yourself stays put.
function seedSubsections() {
  if (DB.getMeta("subsections-2026-10")) return;
  const plan = require("./seed-categories-2.json");
  for (const c of plan.add) if (!DB.slugExists("categories", c.slug)) DB.create("categories", c);
  let moved = 0;
  for (const p of DB.list("products")) {
    const to = plan.move[p.slug];
    if (to && plan.from.includes(p.category)) { DB.update("products", p._id, { category: to }); moved++; }
  }
  for (const slug of plan.removeIfEmpty) {
    const cat = DB.list("categories").find(c => c.slug === slug);
    if (cat && !DB.countWhere("products", "category", slug)) DB.remove("categories", cat._id);
  }
  DB.setMeta("subsections-2026-10", { moved });
  if (moved) console.log(`Arranged ${moved} products into sub-sections.`);
}

// The admin login set in the hosting settings (ADMIN_USERNAME / ADMIN_PASSWORD) always works:
// it is created if missing, and its password is updated whenever the setting changes.
async function ensureAdminFromEnv() {
  const u = String(process.env.ADMIN_USERNAME || "").trim(), p = String(process.env.ADMIN_PASSWORD || "");
  if (!u && !p) return;
  if (!u || !p) { console.warn("Set both ADMIN_USERNAME and ADMIN_PASSWORD to create the admin login."); return; }
  if (p.length < 10) { console.warn(`ADMIN_PASSWORD is only ${p.length} characters; it must be at least 10. Admin login NOT set.`); return; }
  if (p !== p.trim()) console.warn("Note: ADMIN_PASSWORD starts or ends with a space; the space is part of the password.");
  const existing = DB.admins.find(u);
  if (existing && await bcrypt.compare(p, existing.hash)) { console.log(`Admin login '${u.toLowerCase()}' is ready.`); return; }
  DB.admins.upsert(u, await bcrypt.hash(p, 12));
  console.log(existing ? `Admin password for '${u.toLowerCase()}' updated from settings.` : `Admin account '${u.toLowerCase()}' created.`);
}
module.exports = { seedIfEmpty, seedProducts, seedPhotosAndClients, seedSubsections, ensureAdminFromEnv };
