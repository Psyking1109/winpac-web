import { defineStore } from "pinia";
import { api } from "./api";

const COLS = ["groups", "categories", "purposes", "audiences", "brands", "products"];
const EMPTY = { slug: "", name: "", country: "", tags: [], blurb: "", logo: "" };

export const useSite = defineStore("site", {
  state: () => ({ loaded: false, error: "", company: {}, assets: {}, groups: [], categories: [], purposes: [], audiences: [], brands: [], products: [] }),
  getters: {
    brand: s => slug => (slug && s.brands.find(b => b.slug === slug)) || EMPTY,
    cat: s => slug => s.categories.find(c => c.slug === slug) || { slug, name: slug || "", group: "", shape: "bottle", blurb: "" },
    group: s => slug => s.groups.find(g => g.slug === slug) || { slug, name: slug || "", blurb: "" },
    pur: s => slug => s.purposes.find(p => p.slug === slug) || { slug, name: slug },
    product: s => slug => s.products.find(p => p.slug === slug),
    groupOf() { return p => this.cat(p.category).group; }
  },
  actions: {
    async load() {
      try { Object.assign(this, await api.get("/api/site")); this.loaded = true; this.error = ""; }
      catch (e) { this.error = e.message; }
    },
    // Admin: save one item of a collection. New items get their slug from the server.
    async saveItem(col, item) {
      if (!COLS.includes(col)) throw new Error("Unknown list");
      const saved = item._id ? await api.put(`/api/admin/${col}/${item._id}`, item) : await api.post(`/api/admin/${col}`, item);
      const list = this[col], i = list.findIndex(x => x._id === saved._id);
      if (i >= 0) list.splice(i, 1, saved); else if (col === "products") list.unshift(saved); else list.push(saved);
      return saved;
    },
    async removeItem(col, item) {
      await api.del(`/api/admin/${col}/${item._id}`);
      this[col] = this[col].filter(x => x._id !== item._id);
      if (col === "purposes") { this.products.forEach(p => { p.purposes = (p.purposes || []).filter(u => u !== item.slug); }); this.audiences.forEach(a => { a.purposes = (a.purposes || []).filter(u => u !== item.slug); }); }
    },
    async saveSettings(company, assets) {
      const r = await api.put("/api/admin/settings", { company, assets });
      this.company = r.company; this.assets = r.assets;
    }
  }
});

export const useAuth = defineStore("auth", {
  state: () => ({ checked: false, admin: false, username: "" }),
  actions: {
    async check() { try { const r = await api.get("/api/auth/me"); this.admin = r.admin; this.username = r.username || ""; } catch (e) { this.admin = false; } this.checked = true; },
    async login(username, password) { const r = await api.post("/api/auth/login", { username, password }); this.admin = true; this.username = r.username; },
    async logout() { try { await api.post("/api/auth/logout", {}); } finally { this.admin = false; this.username = ""; } }
  }
});

function readList() { try { return JSON.parse(localStorage.getItem("winpac-enquiry") || "[]"); } catch (e) { return []; } }
export const useEnquiry = defineStore("enquiry", {
  state: () => ({ items: readList(), open: false }),
  getters: { count: s => s.items.length },
  actions: {
    persist() { try { localStorage.setItem("winpac-enquiry", JSON.stringify(this.items)); } catch (e) { /* private mode */ } },
    add(slug) { const it = this.items.find(x => x.slug === slug); if (it) it.qty++; else this.items.push({ slug, qty: 1 }); this.persist(); useUi().toast("Added to your enquiry list"); },
    remove(slug) { this.items = this.items.filter(x => x.slug !== slug); this.persist(); },
    setQty(slug, q) { const it = this.items.find(x => x.slug === slug); if (it) { it.qty = Math.max(1, parseInt(q, 10) || 1); this.persist(); } }
  }
});

export const useUi = defineStore("ui", {
  state: () => ({ message: "", timer: null, theme: document.documentElement.getAttribute("data-theme") || "light", menuOpen: false }),
  actions: {
    toast(msg) { this.message = msg; clearTimeout(this.timer); this.timer = setTimeout(() => { this.message = ""; }, 2800); },
    setTheme(t) {
      this.theme = t; document.documentElement.setAttribute("data-theme", t);
      try { localStorage.setItem("winpac-theme", t); } catch (e) { /* ignore */ }
    },
    toggleTheme() { this.setTheme(this.theme === "dark" ? "light" : "dark"); }
  }
});
