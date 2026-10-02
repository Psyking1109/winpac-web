<script setup>
import { useSite } from "../stores";
import BrandMark from "../components/BrandMark.vue";
const site = useSite();
const n = slug => site.products.filter(p => p.brand === slug).length;
</script>
<template>
  <div class="pagehead"><div class="wrap"><div class="crumbs"><RouterLink to="/">Home</RouterLink> / Brands</div><h2 style="font-size:clamp(30px,4vw,48px)">Our brands</h2><p class="lede" style="margin-top:10px">Choose a brand to see its products.</p></div></div>
  <div class="wrap" style="padding-top:36px;padding-bottom:80px"><div class="btiles">
    <RouterLink class="btile" v-for="b in site.brands" :key="b.slug" :to="`/brand/${b.slug}`">
      <BrandMark :b="b" />
      <div class="bt-body"><strong>{{ b.name }}</strong><span>{{ b.country }}<template v-if="b.since"> · since {{ b.since }}</template></span><p>{{ b.blurb }}</p><em>{{ n(b.slug) ? n(b.slug) + " products" : "View range" }}</em></div>
    </RouterLink>
  </div></div>
</template>
