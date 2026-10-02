<script setup>
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useSite } from "../stores";
import { tokens, norm } from "../lib/util";
import AppIcon from "../components/AppIcon.vue";
import ProductCard from "../components/ProductCard.vue";
const site = useSite(), route = useRoute(), router = useRouter();
const f = computed(() => ({ cat: route.query.cat || "", use: route.query.use || "", brand: route.query.brand || "", origin: route.query.origin || "", sort: route.query.sort || "" }));
const q = ref(route.query.q || "");
watch(() => route.query.q, v => { if ((v || "") !== q.value) q.value = v || ""; });
watch(q, v => router.replace({ query: { ...route.query, q: v || undefined } }));
const filtersOpen = ref(false);
function hay(p) { return norm([p.name, site.brand(p.brand).name, site.cat(p.category).name, site.group(site.cat(p.category).group).name, p.summary, p.description, p.origin, ...(p.purposes || []).map(u => site.pur(u).name), ...(p.features || []), ...(p.specs || []).map(s => s.label + " " + s.value)].join(" ")); }
function filtered(skip) {
  const t = tokens(q.value), F = f.value;
  return site.products.filter(p => (skip === "cat" || !F.cat || p.category === F.cat) && (skip === "brand" || !F.brand || p.brand === F.brand) && (skip === "use" || !F.use || (p.purposes || []).includes(F.use)) && (skip === "origin" || !F.origin || p.origin === F.origin) && (!t.length || t.every(x => hay(p).includes(x))));
}
const list = computed(() => {
  const l = filtered();
  if (f.value.sort === "az") l.sort((a, b) => a.name.localeCompare(b.name));
  if (f.value.sort === "brand") l.sort((a, b) => site.brand(a.brand).name.localeCompare(site.brand(b.brand).name) || a.name.localeCompare(b.name));
  return l;
});
const origins = computed(() => [...new Set(site.products.map(p => p.origin).filter(Boolean))].map(o => ({ slug: o, name: o })));
const groups = computed(() => [
  { key: "cat", label: "Category", items: site.categories, test: (p, s) => p.category === s },
  { key: "use", label: "Purpose", items: site.purposes, test: (p, s) => (p.purposes || []).includes(s) },
  { key: "brand", label: "Brand", items: site.brands, test: (p, s) => p.brand === s },
  { key: "origin", label: "Origin", items: origins.value, test: (p, s) => p.origin === s }
].map(g => { const base = filtered(g.key); return { ...g, items: g.items.map(it => ({ ...it, n: base.filter(p => g.test(p, it.slug)).length })).filter(it => it.n || f.value[g.key] === it.slug) }; }));
function toggle(k, v) { router.replace({ query: { ...route.query, [k]: f.value[k] === v ? undefined : v } }); filtersOpen.value = false; }
const nameOf = (k, v) => k === "cat" ? site.cat(v).name : k === "use" ? site.pur(v).name : k === "brand" ? site.brand(v).name : v;
const title = computed(() => f.value.cat ? site.cat(f.value.cat).name : f.value.brand ? site.brand(f.value.brand).name : f.value.use ? site.pur(f.value.use).name : "All products");
</script>
<template>
  <div class="pagehead"><div class="wrap">
    <div class="crumbs"><RouterLink to="/">Home</RouterLink> / Products</div>
    <h2 style="font-size:clamp(30px,4vw,48px)">{{ title }}</h2>
    <p class="lede" style="margin-top:10px">{{ f.cat ? site.cat(f.cat).blurb : "Search the full range, or narrow it by category, brand, purpose and origin." }}</p>
  </div></div>
  <div class="wrap catalog">
    <aside class="filters" :class="{ open: filtersOpen }" aria-label="Filters">
      <button class="btn btn-ghost btn-sm fclose" type="button" @click="filtersOpen = false">Show results</button>
      <div class="fgroup" v-for="g in groups" :key="g.key" v-show="g.items.length">
        <h4>{{ g.label }}</h4>
        <button v-for="it in g.items" :key="it.slug" type="button" class="fopt" :aria-pressed="f[g.key] === it.slug" @click="toggle(g.key, it.slug)"><span>{{ it.name }}</span><span class="c">{{ it.n }}</span></button>
      </div>
    </aside>
    <div>
      <div class="toolbar">
        <div class="search"><AppIcon name="search" /><label class="sr" for="pq">Search products</label><input id="pq" v-model="q" type="search" placeholder="Search by name, brand, stone or use"></div>
        <label class="sr" for="psort">Sort</label>
        <select id="psort" :value="f.sort" @change="router.replace({ query: { ...route.query, sort: $event.target.value || undefined } })"><option value="">Sort: recommended</option><option value="az">Name A to Z</option><option value="brand">By brand</option></select>
        <button class="btn btn-ghost filterbtn" type="button" @click="filtersOpen = true"><AppIcon name="filter" />Filters</button>
      </div>
      <div class="active" v-if="['cat','use','brand','origin'].some(k => f[k])">
        <template v-for="k in ['cat','use','brand','origin']" :key="k"><button v-if="f[k]" type="button" class="chip" @click="toggle(k, f[k])"><b>{{ nameOf(k, f[k]) }}</b> &times;</button></template>
        <button type="button" class="chip" @click="router.replace({ query: { q: q || undefined } })">Clear all</button>
      </div>
      <p class="muted" style="font-size:14px;margin:0 0 14px">{{ list.length }} product{{ list.length === 1 ? "" : "s" }}</p>
      <div class="grid" v-if="list.length"><ProductCard v-for="p in list" :key="p._id" :p="p" /></div>
      <div class="empty" v-else-if="site.products.length">No products match. Try fewer words, or <RouterLink class="link" to="/contact">ask us directly</RouterLink>: we stock more than we list.</div>
      <div class="empty" v-else><h3 style="margin-bottom:8px">Products are being added</h3><p style="margin:0 auto 16px;max-width:46ch">Browse by range or brand, or contact us for anything you need.</p>
        <div class="tags" style="justify-content:center"><RouterLink class="tag" v-for="g in site.groups" :key="g.slug" :to="`/range/${g.slug}`">{{ g.name }}</RouterLink><RouterLink class="tag" v-for="b in site.brands" :key="b.slug" :to="`/brand/${b.slug}`">{{ b.name }}</RouterLink></div></div>
    </div>
  </div>
</template>
