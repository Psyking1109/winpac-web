<script setup>
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useSite, useEnquiry, useAuth } from "../stores";
import { tel, mailto } from "../lib/util";
import AppIcon from "../components/AppIcon.vue";
import BrandMark from "../components/BrandMark.vue";
import ProductImage from "../components/ProductImage.vue";
import ProductCard from "../components/ProductCard.vue";
import NotFound from "./NotFound.vue";
const site = useSite(), enq = useEnquiry(), auth = useAuth(), route = useRoute();
const p = computed(() => site.product(route.params.slug));
const b = computed(() => p.value && site.brand(p.value.brand));
const k = computed(() => p.value && site.cat(p.value.category));
const shown = ref(0);
watch(() => route.params.slug, () => { shown.value = 0; });
const related = computed(() => !p.value ? [] : site.products.filter(x => x._id !== p.value._id && (p.value.brand ? x.brand === p.value.brand : x.category === p.value.category)).sort((a, c) => (c.category === p.value.category) - (a.category === p.value.category)).slice(0, 4));
const msg = computed(() => p.value && `Hello WINPAC,\n\nI'd like details and a price for ${p.value.name}${b.value.name ? ` (${b.value.name})` : ""}.`);
</script>
<template>
  <NotFound v-if="!p" />
  <div class="wrap" v-else>
    <div class="crumbs" style="padding-top:28px">
      <RouterLink to="/">Home</RouterLink> /
      <RouterLink :to="b.slug ? `/brand/${b.slug}` : `/range/${k.group}`">{{ b.name || site.group(k.group).name }}</RouterLink> / {{ p.name }}
    </div>
    <div class="pd">
      <div>
        <div class="gallery"><ProductImage :p="p" :index="shown" /></div>
        <div class="thumbs" v-if="(p.images || []).length > 1">
          <button v-for="(src, i) in p.images" :key="src" type="button" :aria-pressed="shown === i" :aria-label="`Photo ${i + 1}`" @click="shown = i"><img :src="src" alt=""></button>
        </div>
      </div>
      <div>
        <RouterLink v-if="b.slug" class="pd-brand" :to="`/brand/${b.slug}`"><BrandMark :b="b" size="sm" /></RouterLink>
        <h1>{{ p.name }}</h1>
        <p class="summary" v-if="p.summary">{{ p.summary }}</p>
        <div class="tags" style="margin-top:14px">
          <RouterLink class="tag" :to="`/range/${k.group}?cat=${k.slug}`">{{ k.name }}</RouterLink>
          <span v-if="p.origin" class="tag" style="background:var(--gold-soft);color:var(--ink)">Made in {{ p.origin }}</span>
        </div>
        <div class="actions">
          <button class="btn btn-primary" type="button" @click="enq.add(p.slug)"><AppIcon name="plus" />Add to enquiry list</button>
          <a class="btn btn-ghost" :href="mailto(site.company.email, `Enquiry: ${p.name}`, msg)"><AppIcon name="mail" />Email us</a>
          <a class="btn btn-ghost" :href="tel(site.company.mobile)"><AppIcon name="phone" />Call</a>
          <RouterLink v-if="auth.admin" class="btn btn-ghost" :to="{ path: '/admin', query: { edit: p._id } }">Edit product</RouterLink>
        </div>
        <p v-if="p.description" style="white-space:pre-line">{{ p.description }}</p>
        <template v-if="(p.features || []).length"><h4>Key points</h4><ul class="feats"><li v-for="x in p.features" :key="x">{{ x }}</li></ul></template>
        <template v-if="(p.specs || []).length"><h4>Details</h4><table class="specs"><tbody><tr v-for="s in p.specs" :key="s.label"><th scope="row">{{ s.label }}</th><td>{{ s.value }}</td></tr></tbody></table></template>
        <template v-if="(p.purposes || []).length"><h4>Used for</h4><div class="tags"><RouterLink v-for="u in p.purposes" :key="u" class="tag" :to="`/products?use=${u}`">{{ site.pur(u).name }}</RouterLink></div></template>
        <p class="muted" style="font-size:14px;margin-top:22px">Technical and safety data sheets are available on request.</p>
      </div>
    </div>
    <section v-if="related.length" style="padding-bottom:80px"><h2 style="margin-bottom:22px">{{ b.name ? `More from ${b.name}` : "Related products" }}</h2><div class="grid"><ProductCard v-for="x in related" :key="x._id" :p="x" /></div></section>
  </div>
</template>
