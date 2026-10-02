// Stand-alone preview: behaves like the real server, but keeps data in this browser only.
import SEED from "./data.json";
const KEY = "winpac-preview-v1";
const clone = o => JSON.parse(JSON.stringify(o));
// Built-in images are large; store them in the browser as short "@seed:n" references instead.
const SEED_IMGS = []; (function collect(o) { if (typeof o === "string") { if (o.startsWith("data:") && !SEED_IMGS.includes(o)) SEED_IMGS.push(o); } else if (o && typeof o === "object") Object.values(o).forEach(collect); })(SEED);
const pack = o => JSON.stringify(o, (k, v) => (typeof v === "string" && v.startsWith("data:") && SEED_IMGS.indexOf(v) >= 0) ? "@seed:" + SEED_IMGS.indexOf(v) : v);
const unpack = s => JSON.parse(s, (k, v) => (typeof v === "string" && v.startsWith("@seed:")) ? (SEED_IMGS[+v.slice(6)] || "") : v);
let db; try { const raw = localStorage.getItem(KEY); db = raw ? unpack(raw) : clone(SEED); } catch (e) { db = clone(SEED); }
// Bring in products added to the site since this browser first opened the preview.
db.deletedSlugs = db.deletedSlugs || [];
for (const p of SEED.products) {
  const mine = db.products.find(x => x.slug === p.slug);
  if (!mine && !db.deletedSlugs.includes(p.slug)) db.products.unshift(clone(p));
  else if (mine && !(mine.images || []).length && (p.images || []).length) mine.images = clone(p.images);
}
if (!(db.company.clients || []).length) db.company.clients = clone(SEED.company.clients || []);
const abtex = db.brands.find(b => b.slug === "abtex"), seedAbtex = SEED.brands.find(b => b.slug === "abtex");
if (abtex && seedAbtex && !abtex.logo) abtex.logo = seedAbtex.logo;
let admin = false; try { admin = sessionStorage.getItem("winpac-preview-admin") === "1"; } catch (e) { /* ignore */ }
function save() {
  try { localStorage.setItem(KEY, pack(db)); }
  catch (e) { const err = new Error("The preview's storage is full. Use smaller photos, or reset the preview."); err.status = 507; throw err; }
}
const fail = (status, msg) => { const e = new Error(msg); e.status = status; throw e; };
const slugify = s => String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "item";
const COLS = ["groups", "categories", "purposes", "audiences", "brands", "products"];
let nextId = Date.now();

export async function mockRequest(method, url, body) {
  await new Promise(r => setTimeout(r, 120));
  const path = url.split("?")[0];
  if (method === "GET" && path === "/api/site") return clone(db);
  if (path === "/api/auth/me") return { admin, username: admin ? "admin" : null };
  if (path === "/api/auth/login") {
    if (!body || !body.username || !body.password) fail(400, "Enter a username and password");
    admin = true; try { sessionStorage.setItem("winpac-preview-admin", "1"); } catch (e) { /* ignore */ }
    return { admin: true, username: body.username };
  }
  if (path === "/api/auth/logout") { admin = false; try { sessionStorage.removeItem("winpac-preview-admin"); } catch (e) { /* ignore */ } return { ok: true }; }
  if (!path.startsWith("/api/admin/")) fail(404, "Not found");
  if (!admin) fail(401, "Sign in required");
  if (path === "/api/admin/settings") { db.company = { ...db.company, ...(body.company || {}) }; if (body.assets) db.assets = { ...db.assets, ...body.assets }; save(); return { company: db.company, assets: db.assets }; }
  const [, , , col, id] = path.split("/");
  if (!COLS.includes(col)) fail(404, "Unknown collection");
  const list = db[col];
  if (method === "POST") {
    if (!body.name || !String(body.name).trim()) fail(400, "Name is required");
    let base = slugify(body.name), slug = base, n = 2; while (list.some(x => x.slug === slug)) slug = `${base}-${n++}`;
    const { _id, ...rest } = body; const item = { ...rest, slug, _id: String(nextId++) };
    if (col === "products") list.unshift(item); else list.push(item);
    save(); return clone(item);
  }
  const i = list.findIndex(x => x._id === id); if (i < 0) fail(404, "Not found");
  if (method === "PUT") { const { _id, slug, ...rest } = body; list[i] = { ...list[i], ...rest }; save(); return clone(list[i]); }
  if (method === "DELETE") {
    const doc = list[i];
    if (col === "brands" && db.products.some(p => p.brand === doc.slug)) fail(409, "Move this brand's products to another brand first.");
    if (col === "categories" && db.products.some(p => p.category === doc.slug)) fail(409, "Move this category's products to another category first.");
    if (col === "groups" && db.categories.some(k => k.group === doc.slug)) fail(409, "Move this range's categories to another range first.");
    if (col === "purposes") [...db.products, ...db.audiences].forEach(x => { x.purposes = (x.purposes || []).filter(u => u !== doc.slug); });
    if (col === "products") db.deletedSlugs.push(doc.slug);
    list.splice(i, 1); save(); return { ok: true };
  }
  fail(405, "Not allowed");
}
export function mockUpload(blob) {
  return new Promise((resolve, reject) => { const r = new FileReader(); r.onload = () => resolve({ url: r.result }); r.onerror = () => reject(new Error("Couldn't read that image")); r.readAsDataURL(blob); });
}
export function resetPreview() { try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ } location.reload(); }
