<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useSite } from "../stores";
import ProductCard from "../components/ProductCard.vue";
import EmptyRange from "../components/EmptyRange.vue";
import CtaBlock from "../components/CtaBlock.vue";
import NotFound from "./NotFound.vue";
const site = useSite(), route = useRoute();
const a = computed(() => site.audiences.find(x => x.slug === route.params.slug));
const byCat = computed(() => {
  if (!a.value) return [];
  const list = site.products.filter(p => (p.purposes || []).some(u => a.value.purposes.includes(u)));
  return site.categories.map(k => ({ k, items: list.filter(p => p.category === k.slug) })).filter(x => x.items.length);
});
</script>
<template>
  <NotFound v-if="!a" />
  <template v-else>
    <div class="pagehead"><div class="wrap">
      <div class="crumbs"><RouterLink to="/">Home</RouterLink> / <RouterLink to="/solutions">Solutions</RouterLink> / {{ a.name }}</div>
      <h2 style="font-size:clamp(30px,4vw,52px)">{{ a.name }}</h2><p class="lede" style="margin-top:10px">{{ a.blurb }}</p>
      <div class="tags" style="margin-top:16px"><RouterLink v-for="u in a.purposes" :key="u" class="tag" :to="`/products?use=${u}`">{{ site.pur(u).name }}</RouterLink></div>
    </div></div>
    <div class="wrap" style="padding-top:36px;padding-bottom:40px">
      <template v-for="x in byCat" :key="x.k.slug">
        <div class="sec-head" style="margin:10px 0 18px"><h3>{{ x.k.name }}</h3><RouterLink class="link" :to="`/range/${x.k.group}?cat=${x.k.slug}`">All {{ x.k.name.toLowerCase() }}</RouterLink></div>
        <div class="grid" style="margin-bottom:44px"><ProductCard v-for="p in x.items" :key="p._id" :p="p" /></div>
      </template>
      <EmptyRange v-if="!byCat.length" title="Products for this work are being added" :subject="a.name" />
    </div>
    <CtaBlock />
  </template>
</template>
