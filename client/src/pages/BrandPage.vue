<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useSite } from "../stores";
import BrandMark from "../components/BrandMark.vue";
import ProductBrowser from "../components/ProductBrowser.vue";
import EmptyRange from "../components/EmptyRange.vue";
import NotFound from "./NotFound.vue";
const site = useSite(), route = useRoute();
const b = computed(() => site.brands.find(x => x.slug === route.params.slug));
const products = computed(() => site.products.filter(p => p.brand === route.params.slug));
</script>
<template>
  <NotFound v-if="!b" />
  <div class="wrap" v-else>
    <div class="brandhero">
      <div>
        <div class="crumbs"><RouterLink to="/">Home</RouterLink> / <RouterLink to="/brands">Brands</RouterLink> / {{ b.name }}</div>
        <BrandMark :b="b" size="lg" />
        <h1 style="font-size:clamp(32px,4.5vw,54px);margin-top:18px">{{ b.name }}</h1>
        <p class="lede" style="margin-top:12px">{{ b.blurb }}</p>
        <div class="tags" style="margin-top:14px"><span class="tag" v-for="t in b.tags" :key="t">{{ t }}</span></div>
      </div>
      <div class="facts">
        <div><b>{{ b.country || "-" }}</b><span>Country</span></div>
        <div><b>{{ b.since || "-" }}</b><span>With WINPAC since</span></div>
        <div v-if="b.url" style="grid-column:1/-1"><a class="link" :href="b.url" target="_blank" rel="noopener">{{ b.url.replace(/^https?:\/\//, "") }}</a></div>
      </div>
    </div>
    <div style="padding:32px 0 80px">
      <ProductBrowser v-if="products.length" :products="products" :label="`${b.name} products`" :add-brand="b.slug" />
      <EmptyRange v-else :title="`${b.name} products are being added`" :subject="`${b.name} range`" :add-brand="b.slug" />
    </div>
  </div>
</template>
