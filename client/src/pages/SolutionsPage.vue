<script setup>
import { useSite } from "../stores";
import CtaBlock from "../components/CtaBlock.vue";
const site = useSite();
const n = u => site.products.filter(p => (p.purposes || []).includes(u)).length;
</script>
<template>
  <div class="pagehead"><div class="wrap"><div class="crumbs"><RouterLink to="/">Home</RouterLink> / Solutions</div><h2 style="font-size:clamp(30px,4vw,48px)">Solutions by the work you do</h2><p class="lede" style="margin-top:10px">Pick your trade, or a single job, and see the products that do it.</p></div></div>
  <div class="wrap" style="padding-top:30px;padding-bottom:20px">
    <div class="needs">
      <RouterLink v-for="(a, i) in site.audiences" :key="a.slug" class="need" :class="{ star: i === 0 }" :to="`/solutions/${a.slug}`"><h3>{{ a.name }}</h3><p>{{ a.blurb }}</p><span class="count">Explore</span></RouterLink>
    </div>
    <h3 style="margin:56px 0 16px">By job</h3>
    <div class="tags"><RouterLink v-for="u in site.purposes" :key="u.slug" class="tag" style="font-size:15px;padding:8px 14px" :to="`/products?use=${u.slug}`">{{ u.name }}<template v-if="n(u.slug)"> ({{ n(u.slug) }})</template></RouterLink></div>
  </div>
  <CtaBlock />
</template>
