<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useSite } from "../stores";
import ProductBrowser from "../components/ProductBrowser.vue";
import EmptyRange from "../components/EmptyRange.vue";
import OriginsBlock from "../components/OriginsBlock.vue";
import CtaBlock from "../components/CtaBlock.vue";
import NotFound from "./NotFound.vue";
const site = useSite(), route = useRoute();
const g = computed(() => site.groups.find(x => x.slug === route.params.slug));
const products = computed(() => site.products.filter(p => site.cat(p.category).group === route.params.slug));
</script>
<template>
  <NotFound v-if="!g" />
  <template v-else>
    <div class="pagehead"><div class="wrap">
      <div class="crumbs"><RouterLink to="/">Home</RouterLink> / {{ g.name }}</div>
      <h2 style="font-size:clamp(30px,4vw,52px)">{{ g.name }}</h2>
      <p class="lede" style="margin-top:10px">{{ g.slug === "stones" ? site.company.stonesText : g.blurb }}</p>
    </div></div>
    <div class="wrap" style="padding-top:36px" v-if="g.slug === 'stones'"><OriginsBlock /></div>
    <div class="wrap" style="padding-top:32px;padding-bottom:70px">
      <ProductBrowser v-if="products.length" :products="products" :label="g.name.toLowerCase()" />
      <EmptyRange v-else :title="`${g.name} are being added`" :subject="`${g.name} enquiry`" />
    </div>
    <CtaBlock />
  </template>
</template>
