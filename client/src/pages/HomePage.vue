<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useSite } from "../stores";
import AppIcon from "../components/AppIcon.vue";
import GritBand from "../components/GritBand.vue";
import ProductArt from "../components/ProductArt.vue";
import BrandMark from "../components/BrandMark.vue";
import ProductCard from "../components/ProductCard.vue";
import OriginsBlock from "../components/OriginsBlock.vue";
import CtaBlock from "../components/CtaBlock.vue";
import ClientLogos from "../components/ClientLogos.vue";
const site = useSite(), router = useRouter();
const c = computed(() => site.company);
const q = ref("");
const search = () => router.push({ path: "/products", query: q.value.trim() ? { q: q.value.trim() } : {} });
const count = fn => site.products.filter(fn).length;
const featured = computed(() => site.products.filter(p => p.featured).slice(0, 8));
const chemCat = computed(() => site.categories.find(k => k.group === "chemicals" && /custom/i.test(k.name)));
</script>
<template>
  <section class="hero"><div class="wrap">
    <h1>{{ c.tagline }}</h1>
    <p class="lede">{{ c.intro }} Since {{ c.est }}.</p>
    <form class="bigsearch" role="search" @submit.prevent="search">
      <label class="sr" for="bq">Search products</label><input id="bq" v-model="q" type="search" placeholder="Search by product, brand or use">
      <button class="btn btn-primary" type="submit"><AppIcon name="search" />Search</button>
    </form>
    <GritBand />
  </div></section>

  <section class="sec"><div class="wrap">
    <div class="sec-head"><div><h2>Our ranges</h2></div><RouterLink class="link" to="/products">All products</RouterLink></div>
    <div class="rtiles">
      <RouterLink class="rtile" v-for="g in site.groups" :key="g.slug" :to="`/range/${g.slug}`">
        <div class="art"><ProductArt :shape="(site.categories.find(k => k.group === g.slug) || {}).shape" :seed="g.slug" /></div>
        <h3>{{ g.name }}</h3><p>{{ g.blurb }}</p>
        <span class="n">{{ count(p => site.cat(p.category).group === g.slug) ? count(p => site.cat(p.category).group === g.slug) + " products" : site.categories.filter(k => k.group === g.slug).map(k => k.name).join(" · ") }}</span>
      </RouterLink>
    </div>
  </div></section>

  <section class="sec sunk" v-if="featured.length"><div class="wrap">
    <div class="sec-head"><div><h2>Featured products</h2></div><RouterLink class="link" to="/products">All products</RouterLink></div>
    <div class="grid"><ProductCard v-for="p in featured" :key="p._id" :p="p" /></div>
  </div></section>

  <section class="sec" :class="{ sunk: !featured.length }"><div class="wrap">
    <div class="sec-head"><div><h2>Our brands</h2><p class="muted">Official distributorships from India, China, Spain and Italy. Choose a brand to see its products.</p></div><RouterLink class="link" to="/brands">All brands</RouterLink></div>
    <div class="btiles">
      <RouterLink class="btile" v-for="b in site.brands" :key="b.slug" :to="`/brand/${b.slug}`">
        <BrandMark :b="b" />
        <div class="bt-body"><strong>{{ b.name }}</strong><span>{{ b.country }}<template v-if="b.since"> · since {{ b.since }}</template></span><p>{{ (b.tags || []).join(", ") }}</p>
          <em>{{ count(p => p.brand === b.slug) ? count(p => p.brand === b.slug) + " products" : "View range" }}</em></div>
      </RouterLink>
    </div>
  </div></section>

  <section class="sec"><div class="wrap">
    <div class="sec-head"><div><h2>Find what your work needs</h2><p class="muted">Start from the job you do.</p></div><RouterLink class="link" to="/solutions">All solutions</RouterLink></div>
    <div class="needs">
      <RouterLink v-for="(a, i) in site.audiences" :key="a.slug" class="need" :class="{ star: i === 0 }" :to="`/solutions/${a.slug}`">
        <h3>{{ a.name }}</h3><p>{{ a.blurb }}</p><span class="count">Explore</span>
      </RouterLink>
    </div>
  </div></section>

  <section class="sec band" v-if="c.chemTitle"><div class="wrap form-grid">
    <div><h2>{{ c.chemTitle }}</h2><p class="lede" style="margin-top:16px">{{ c.chemText }}</p></div>
    <div class="form-list">
      <RouterLink v-for="x in c.chemItems" :key="x.label" :to="chemCat ? `/range/chemicals?cat=${chemCat.slug}` : '/contact'"><strong>{{ x.label }}</strong><span>{{ x.value }}</span></RouterLink>
    </div>
  </div></section>

  <section class="sec"><div class="wrap">
    <div class="sec-head"><div><h2>Natural stone aggregates</h2><p class="muted">{{ c.stonesText }}</p></div><RouterLink class="link" to="/range/stones">See stones</RouterLink></div>
    <OriginsBlock />
  </div></section>
  <section class="sec-tight sunk" v-if="(c.clients || []).length"><div class="wrap">
    <div class="sec-head" style="margin-bottom:22px"><div><h2>Trusted by</h2><p class="muted">Hotels, venues and manufacturers across Sri Lanka.</p></div><RouterLink class="link" to="/about">About us</RouterLink></div>
    <ClientLogos />
  </div></section>
  <CtaBlock />
</template>
