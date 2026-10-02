"use strict";
require("dotenv").config();
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const express = require("express");
const helmet = require("helmet");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const DB = require("./db");
const { seedIfEmpty, seedProducts, seedPhotosAndClients, ensureAdminFromEnv } = require("./seed");

const PORT = +process.env.PORT || 8080;
const PROD = process.env.NODE_ENV === "production";
const COOKIE_SECURE = process.env.COOKIE_SECURE ? process.env.COOKIE_SECURE === "1" : PROD;
const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || path.join(DB.DATA_DIR, "uploads"));
const DIST = path.join(__dirname, "..", "client", "dist");
const SESSION_HOURS = 12;
let JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  JWT_SECRET = crypto.randomBytes(48).toString("hex");
  console.warn("JWT_SECRET is not set: using a temporary one. Admins will be signed out when the server restarts.");
}
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const app = express();
app.disable("x-powered-by");
if (process.env.TRUST_PROXY === "1") app.set("trust proxy", 1);
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'"],
      frameAncestors: ["'none'"],
      formAction: ["'self'", "mailto:"],
      upgradeInsecureRequests: COOKIE_SECURE ? [] : null
    }
  },
  crossOriginEmbedderPolicy: false
}));
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));

/* ---------------- helpers */
const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/* ---------------- auth */
function sign(admin) { return jwt.sign({ sub: String(admin.id), u: admin.username }, JWT_SECRET, { expiresIn: `${SESSION_HOURS}h` }); }
function currentAdmin(req) {
  const t = req.cookies && req.cookies.wp_admin;
  if (!t) return null;
  try { return jwt.verify(t, JWT_SECRET); } catch (e) { return null; }
}
function requireAdmin(req, res, next) {
  const a = currentAdmin(req);
  if (!a) return res.status(401).json({ error: "Sign in required" });
  req.admin = a; next();
}
// Changes must come from this site's own pages (plus SameSite=Strict cookies).
function sameSite(req, res, next) {
  if (req.method === "GET" || req.method === "HEAD") return next();
  if (req.get("X-Requested-With") !== "winpac") return res.status(403).json({ error: "Forbidden" });
  next();
}
app.use("/api", sameSite);
app.use("/api", rateLimit({ windowMs: 60_000, limit: 300, standardHeaders: true, legacyHeaders: false }));
const loginLimiter = rateLimit({ windowMs: 15 * 60_000, limit: 10, standardHeaders: true, legacyHeaders: false, message: { error: "Too many attempts. Try again in 15 minutes." } });

app.post("/api/auth/login", loginLimiter, wrap(async (req, res) => {
  const { username, password } = req.body || {};
  if (typeof username !== "string" || typeof password !== "string") return res.status(400).json({ error: "Enter a username and password" });
  const admin = DB.admins.find(username);
  const ok = await bcrypt.compare(password, admin ? admin.hash : "$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinv");
  if (!admin || !ok) return res.status(401).json({ error: "Wrong username or password" });
  res.cookie("wp_admin", sign(admin), { httpOnly: true, sameSite: "strict", secure: COOKIE_SECURE, maxAge: SESSION_HOURS * 3600e3, path: "/" });
  res.json({ admin: true, username: admin.username });
}));
app.post("/api/auth/logout", (req, res) => { res.clearCookie("wp_admin", { path: "/" }); res.json({ ok: true }); });
app.get("/api/auth/me", (req, res) => { const a = currentAdmin(req); res.set("Cache-Control", "no-store").json({ admin: !!a, username: a ? a.u : null }); });

/* ---------------- public data */
app.get("/api/site", (req, res) => {
  const st = DB.getSettings() || { company: {}, assets: {} };
  const out = { company: st.company, assets: st.assets };
  for (const c of DB.COLS) out[c] = DB.list(c);
  res.set("Cache-Control", "no-cache").json(out);
});

/* ---------------- admin: settings */
app.put("/api/admin/settings", requireAdmin, (req, res) => {
  res.json(DB.saveSettings(req.body || {}));
});

/* ---------------- admin: image uploads */
const TYPES = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (req, file, cb) => cb(null, crypto.randomBytes(12).toString("hex") + "." + TYPES[file.mimetype])
  }),
  limits: { fileSize: 8 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) => cb(null, !!TYPES[file.mimetype])
});
function realImage(file) {
  const b = Buffer.alloc(12); const fd = fs.openSync(file, "r"); fs.readSync(fd, b, 0, 12, 0); fs.closeSync(fd);
  return (b[0] === 0xff && b[1] === 0xd8) || b.slice(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47])) || (b.slice(0, 4).toString() === "RIFF" && b.slice(8, 12).toString() === "WEBP");
}
app.post("/api/admin/uploads", requireAdmin, upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Upload a JPG, PNG or WEBP image" });
  if (!realImage(req.file.path)) { fs.unlinkSync(req.file.path); return res.status(400).json({ error: "That file is not a valid image" }); }
  res.status(201).json({ url: "/uploads/" + req.file.filename });
});

/* ---------------- admin: collections */
function col(req, res, next) {
  if (!DB.COLS.includes(req.params.col)) return res.status(404).json({ error: "Unknown collection" });
  next();
}
function validId(req, res, next) { if (!/^\d{1,12}$/.test(req.params.id)) return res.status(404).json({ error: "Not found" }); next(); }

app.post("/api/admin/:col", requireAdmin, col, (req, res) => res.status(201).json(DB.create(req.params.col, req.body || {})));
app.put("/api/admin/:col/:id", requireAdmin, col, validId, (req, res) => {
  const doc = DB.update(req.params.col, req.params.id, req.body || {});
  if (!doc) return res.status(404).json({ error: "Not found" });
  res.json(doc);
});
app.delete("/api/admin/:col/:id", requireAdmin, col, validId, (req, res) => {
  const c = req.params.col, doc = DB.get(c, req.params.id);
  if (!doc) return res.status(404).json({ error: "Not found" });
  if (c === "brands" && DB.countWhere("products", "brand", doc.slug)) return res.status(409).json({ error: "Move this brand's products to another brand first." });
  if (c === "categories" && DB.countWhere("products", "category", doc.slug)) return res.status(409).json({ error: "Move this category's products to another category first." });
  if (c === "groups" && DB.countWhere("categories", "group", doc.slug)) return res.status(409).json({ error: "Move this range's categories to another range first." });
  if (c === "purposes") DB.pullPurpose(doc.slug);
  DB.remove(c, doc._id);
  res.json({ ok: true });
});

/* ---------------- errors for the API */
app.use("/api", (req, res) => res.status(404).json({ error: "Not found" }));
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  if (err instanceof multer.MulterError) return res.status(400).json({ error: err.code === "LIMIT_FILE_SIZE" ? "Image is larger than 8 MB" : "Upload failed" });
  if (err instanceof DB.ValidationError) return res.status(400).json({ error: err.message });
  if (err.type === "entity.too.large") return res.status(413).json({ error: "Request too large" });
  if (err.type === "entity.parse.failed") return res.status(400).json({ error: "Bad request" });
  console.error(err);
  res.status(500).json({ error: "Server error" });
});

/* ---------------- files and the Vue app */
app.use("/uploads", express.static(UPLOAD_DIR, { maxAge: "365d", immutable: true, index: false, dotfiles: "deny" }));
app.use(express.static(DIST, { index: false, maxAge: "1h", setHeaders: (res, p) => { if (p.includes(`${path.sep}assets${path.sep}`)) res.set("Cache-Control", "public, max-age=31536000, immutable"); } }));
app.get("*", (req, res) => {
  const index = path.join(DIST, "index.html");
  if (!fs.existsSync(index)) return res.status(503).send("The website has not been built yet. Run: npm run build");
  res.set("Cache-Control", "no-cache").sendFile(index);
});

/* ---------------- start */
(async () => {
  console.log("Database: " + DB.DB_FILE);
  seedIfEmpty(UPLOAD_DIR);
  seedProducts();
  seedPhotosAndClients();
  await ensureAdminFromEnv();
  if (!DB.admins.count()) console.log("No admin account yet. Create one with: npm run create-admin -- <username> <password>");
  app.listen(PORT, () => console.log(`WINPAC website running on http://localhost:${PORT}`));
})().catch(e => { console.error("Could not start:", e.message); process.exit(1); });
