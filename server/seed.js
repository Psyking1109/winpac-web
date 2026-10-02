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
async function ensureAdminFromEnv() {
  const u = process.env.ADMIN_USERNAME, p = process.env.ADMIN_PASSWORD;
  if (!u || !p || DB.admins.count()) return;
  if (p.length < 10) { console.warn("ADMIN_PASSWORD must be at least 10 characters; no admin created."); return; }
  DB.admins.upsert(u, await bcrypt.hash(p, 12));
  console.log(`Admin account '${u}' created.`);
}
module.exports = { seedIfEmpty, seedProducts, seedPhotosAndClients, ensureAdminFromEnv };
