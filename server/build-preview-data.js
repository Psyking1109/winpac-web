"use strict";
// Builds the data used by the stand-alone preview (images inlined as data URLs).
const fs = require("fs"), path = require("path");
const seed = require("./seed-data.json");
const packs = ["seed-products.json", "seed-products-2.json", "seed-products-3.json", "seed-products-4.json"].flatMap(f => require("./" + f));
const asset = p => {
  if (!p || !p.startsWith("/uploads/seed/")) return p || "";
  const f = path.join(__dirname, "seed-assets", p.slice("/uploads/seed/".length));
  const ext = path.extname(f).slice(1).replace("jpg", "jpeg");
  return `data:image/${ext};base64,` + fs.readFileSync(f).toString("base64");
};
let n = 1; const id = () => String(n++);
const out = {
  company: { ...seed.company, logo: asset(seed.company.logo), clients: require("./seed-clients.json").map(c => ({ ...c, logo: asset(c.logo) })) },
  assets: { grit: asset(seed.assets.grit) },
  groups: seed.groups.map(x => ({ ...x, _id: id() })),
  categories: seed.categories.map(x => ({ ...x, _id: id() })),
  purposes: seed.purposes.map(x => ({ ...x, _id: id() })),
  audiences: seed.audiences.map(x => ({ ...x, _id: id() })),
  brands: seed.brands.map(x => ({ ...x, logo: asset(x.logo), _id: id() })),
  products: packs.map(p => ({ images: [], features: [], specs: [], purposes: [], ...p, _id: id() })).map(p => ({ ...p, images: (require("./seed-photos.json")[p.slug] || p.images).map(asset) })).reverse()
};
const plan = require("./seed-categories-2.json");
for (const c of plan.add) if (!out.categories.some(k => k.slug === c.slug)) out.categories.push({ ...c, _id: id() });
out.products.forEach(p => { if (plan.move[p.slug] && plan.from.includes(p.category)) p.category = plan.move[p.slug]; });
out.categories = out.categories.filter(c => !plan.removeIfEmpty.includes(c.slug) || out.products.some(p => p.category === c.slug));
out.categories.sort((a, b) => (a.order || 0) - (b.order || 0));
fs.writeFileSync(path.join(__dirname, "..", "client", "src", "preview", "data.json"), JSON.stringify(out));
console.log(`Preview data: ${out.products.length} products, ${out.brands.length} brands.`);
