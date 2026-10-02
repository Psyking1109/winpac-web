"use strict";
// All site data lives in one SQLite file (data/winpac.db) using the SQLite built into Node.js.
// Each record is stored as validated JSON; only known fields are ever saved.

// Node prints a one-time "experimental" notice for its built-in SQLite; hide just that notice.
const emit = process.emitWarning;
process.emitWarning = (w, ...a) => { if (String(w && w.message || w).includes("SQLite")) return; return emit.call(process, w, ...a); };

const fs = require("fs");
const path = require("path");
const { DatabaseSync } = require("node:sqlite");

const DATA_DIR = path.resolve(process.env.DATA_DIR || path.join(__dirname, "..", "data"));
fs.mkdirSync(DATA_DIR, { recursive: true });
const DB_FILE = path.join(DATA_DIR, "winpac.db");
const db = new DatabaseSync(DB_FILE);
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    col TEXT NOT NULL, slug TEXT NOT NULL, ord INTEGER NOT NULL DEFAULT 0,
    data TEXT NOT NULL, created INTEGER NOT NULL, updated INTEGER NOT NULL,
    UNIQUE (col, slug));
  CREATE INDEX IF NOT EXISTS items_col ON items (col);
  CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, data TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS admins (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL UNIQUE, hash TEXT NOT NULL);
`);

/* ---------------- field rules */
class ValidationError extends Error { constructor(m) { super(m); this.name = "ValidationError"; } }
const T = {
  str: max => v => { if (v == null) return ""; if (typeof v !== "string" && typeof v !== "number") throw new ValidationError("Text expected"); return String(v).trim().slice(0, max); },
  strs: (n, max) => v => (Array.isArray(v) ? v : []).slice(0, n).map(T.str(max)).filter(Boolean),
  pairs: n => v => (Array.isArray(v) ? v : []).slice(0, n).map(x => ({ label: T.str(300)(x && x.label), value: T.str(1000)(x && x.value) })).filter(x => x.label || x.value),
  bool: () => v => !!v,
  int: () => v => Number.isFinite(+v) ? Math.max(-1e6, Math.min(1e6, Math.round(+v))) : 0,
  url: () => v => { const s = T.str(300)(v); if (s && !/^https?:\/\/[^\s"'<>]+$/i.test(s)) throw new ValidationError("Website must start with http:// or https://"); return s; },
  img: () => v => { const s = T.str(300)(v); if (s && !/^\/uploads\/[a-z0-9/_.-]+\.(jpg|png|webp)$/i.test(s)) throw new ValidationError("Invalid image"); return s; },
  imgs: n => v => (Array.isArray(v) ? v : []).slice(0, n).map(T.img()).filter(Boolean),
  slug: () => v => T.str(80)(v).toLowerCase().replace(/[^a-z0-9-]/g, "")
};
const SPEC = {
  groups: { name: T.str(80), blurb: T.str(600), order: T.int() },
  categories: { name: T.str(120), group: T.slug(), shape: T.slug(), blurb: T.str(600), order: T.int() },
  purposes: { name: T.str(120), order: T.int() },
  audiences: { name: T.str(120), blurb: T.str(800), purposes: v => T.strs(40, 80)(v).map(s => T.slug()(s)), order: T.int() },
  brands: { name: T.str(120), country: T.str(80), since: T.str(10), blurb: T.str(1500), tags: T.strs(20, 80), url: T.url(), logo: T.img(), order: T.int() },
  products: {
    name: T.str(200), brand: T.slug(), category: T.slug(), origin: T.str(60),
    purposes: v => T.strs(40, 80)(v).map(s => T.slug()(s)), summary: T.str(300), description: T.str(8000),
    features: T.strs(40, 400), specs: T.pairs(40), images: T.imgs(6), featured: T.bool()
  }
};
const COMPANY = {
  name: T.str(200), short: T.str(40), est: T.str(10), tagline: T.str(200), intro: T.str(1000), motto: T.str(300),
  about: T.str(4000), vision: T.str(1500), mission: T.str(1500), address: T.str(300), phones: T.str(200), mobile: T.str(60),
  email: T.str(200), hours: T.str(200), logo: T.img(), chemTitle: T.str(200), chemText: T.str(1500), chemItems: T.pairs(30),
  stonesText: T.str(1500), timeline: T.pairs(60), customers: T.strs(60, 120),
  clients: v => (Array.isArray(v) ? v : []).slice(0, 60).map(x => ({ name: T.str(120)(x && x.name), logo: T.img()(x && x.logo) })).filter(x => x.name || x.logo)
};
function clean(spec, body, base) {
  const out = { ...(base || {}) };
  for (const k of Object.keys(body || {})) if (spec[k]) out[k] = spec[k](body[k]);
  return out;
}
const COLS = Object.keys(SPEC);
const slugify = s => String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "item";

/* ---------------- collections */
const row2obj = r => r && ({ ...JSON.parse(r.data), _id: String(r.id), slug: r.slug, order: r.ord, createdAt: r.created, updatedAt: r.updated });
const q = {
  list: db.prepare("SELECT * FROM items WHERE col = ? ORDER BY ord, json_extract(data, '$.name') COLLATE NOCASE"),
  listNewest: db.prepare("SELECT * FROM items WHERE col = ? ORDER BY created DESC, id DESC"),
  get: db.prepare("SELECT * FROM items WHERE col = ? AND id = ?"),
  slugTaken: db.prepare("SELECT 1 FROM items WHERE col = ? AND slug = ?"),
  insert: db.prepare("INSERT INTO items (col, slug, ord, data, created, updated) VALUES (?, ?, ?, ?, ?, ?)"),
  update: db.prepare("UPDATE items SET ord = ?, data = ?, updated = ? WHERE col = ? AND id = ?"),
  del: db.prepare("DELETE FROM items WHERE col = ? AND id = ?"),
  countWhere: db.prepare("SELECT COUNT(*) n FROM items WHERE col = ? AND json_extract(data, '$.' || ?) = ?"),
  count: db.prepare("SELECT COUNT(*) n FROM items WHERE col = ?")
};
function list(col) { return (col === "products" ? q.listNewest : q.list).all(col).map(row2obj); }
function get(col, id) { return row2obj(q.get.get(col, +id)); }
function uniqueSlug(col, base) { let s = base, n = 2; while (q.slugTaken.get(col, s)) s = `${base}-${n++}`; return s; }
function create(col, body) {
  const data = clean(SPEC[col], body, {});
  if (!data.name) throw new ValidationError("Name is required");
  const slug = uniqueSlug(col, slugify(body.slug || data.name));
  const now = Date.now(), ord = data.order || 0; delete data.order;
  const r = q.insert.run(col, slug, ord, JSON.stringify(data), now, now);
  return get(col, r.lastInsertRowid);
}
function update(col, id, body) {
  const cur = get(col, id); if (!cur) return null;
  const { _id, slug, createdAt, updatedAt, order, ...base } = cur;
  const data = clean(SPEC[col], body, { ...base, order });
  if (!data.name) throw new ValidationError("Name is required");
  const ord = data.order || 0; delete data.order;
  q.update.run(ord, JSON.stringify(data), Date.now(), col, +id);
  return get(col, id);
}
function remove(col, id) { q.del.run(col, +id); }
function countWhere(col, field, value) { return q.countWhere.get(col, field, value).n; }
function count(col) { return q.count.get(col).n; }
// Remove a purpose from every product and solution that uses it.
function pullPurpose(slug) {
  db.exec("BEGIN");
  try {
    for (const col of ["products", "audiences"]) for (const it of list(col)) {
      if ((it.purposes || []).includes(slug)) {
        const { _id, slug: s, createdAt, updatedAt, order, ...data } = it;
        data.purposes = data.purposes.filter(u => u !== slug);
        q.update.run(order || 0, JSON.stringify(data), Date.now(), col, +_id);
      }
    }
    db.exec("COMMIT");
  } catch (e) { db.exec("ROLLBACK"); throw e; }
}

/* ---------------- settings */
function getSettings() { const r = db.prepare("SELECT data FROM settings WHERE key = 'site'").get(); return r ? JSON.parse(r.data) : null; }
function saveSettings(body) {
  const cur = getSettings() || { company: {}, assets: {} };
  const next = { company: clean(COMPANY, body.company || {}, cur.company), assets: { grit: body.assets && body.assets.grit !== undefined ? T.img()(body.assets.grit) : cur.assets.grit || "" } };
  db.prepare("INSERT INTO settings (key, data) VALUES ('site', ?) ON CONFLICT(key) DO UPDATE SET data = excluded.data").run(JSON.stringify(next));
  return next;
}

/* ---------------- admins */
const admins = {
  find: u => db.prepare("SELECT * FROM admins WHERE username = ?").get(String(u || "").toLowerCase().trim()),
  count: () => db.prepare("SELECT COUNT(*) n FROM admins").get().n,
  upsert(username, hash) {
    const u = username.toLowerCase().trim(), had = !!admins.find(u);
    db.prepare("INSERT INTO admins (username, hash) VALUES (?, ?) ON CONFLICT(username) DO UPDATE SET hash = excluded.hash").run(u, hash);
    return had;
  }
};

/* ---------------- seed and backup */
function isEmpty() { return !getSettings(); }
function seed(data) {
  db.exec("BEGIN");
  try {
    saveSettings({ company: data.company, assets: data.assets });
    for (const col of ["groups", "categories", "purposes", "audiences", "brands"]) for (const it of data[col] || []) create(col, it);
    db.exec("COMMIT");
  } catch (e) { db.exec("ROLLBACK"); throw e; }
}
// Small flags, e.g. which product packs have been added.
function getMeta(key) { const r = db.prepare("SELECT data FROM settings WHERE key = ?").get("meta:" + key); return r ? JSON.parse(r.data) : null; }
function setMeta(key, value) { db.prepare("INSERT INTO settings (key, data) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET data = excluded.data").run("meta:" + key, JSON.stringify(value)); }
function slugExists(col, slug) { return !!q.slugTaken.get(col, slug); }
function backup(file) { db.exec(`VACUUM INTO '${String(file).replace(/'/g, "''")}'`); }

module.exports = { COLS, ValidationError, list, get, create, update, remove, countWhere, count, pullPurpose, getSettings, saveSettings, admins, isEmpty, seed, backup, getMeta, setMeta, slugExists, DB_FILE, DATA_DIR };
