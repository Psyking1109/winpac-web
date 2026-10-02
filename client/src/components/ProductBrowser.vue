<script setup>
// Category tabs + search + product grid. Used on range and brand pages.
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useSite, useAuth } from "../stores";
import { tokens, norm } from "../lib/util";
import ProductCard from "./ProductCard.vue";
import AppIcon from "./AppIcon.vue";
const props = defineProps({ products: Array, label: String, addBrand: { type: String, default: "" } });
const site = useSite(), auth = useAuth(), route = useRoute(), router = useRouter();
const q = ref(route.query.q || "");
const sel = computed(() => route.query.cat || "");
const cats = computed(() => { const seen = []; props.products.forEach(p => { if (!seen.includes(p.category)) seen.push(p.category); }); return site.categories.filter(c => seen.includes(c.slug)); });
const list = computed(() => { const t = tokens(q.value); return props.products.filter(p => (!sel.value || p.category === sel.value) && t.every(x => norm(`${p.name} ${site.brand(p.brand).name} ${p.summary} ${p.description}`).includes(x))); });
watch(q, v => router.replace({ query: { ...route.query, q: v || undefined } }));
const setCat = c => router.replace({ query: { ...route.query, cat: c || undefined } });
</script>
<template>
  <div>
    <div class="btabs" v-if="cats.length > 1">
      <button type="button" :aria-pressed="!sel" @click="setCat('')">All ({{ products.length }})</button>
      <button type="button" v-for="c in cats" :key="c.slug" :aria-pressed="sel === c.slug" @click="setCat(c.slug)">{{ c.name }} ({{ products.filter(p => p.category === c.slug).length }})</button>
    </div>
    <div class="toolbar">
      <div class="search"><AppIcon name="search" /><label class="sr" for="pb-q">Search {{ label }}</label><input id="pb-q" v-model="q" type="search" :placeholder="`Search ${label}`"></div>
      <RouterLink v-if="auth.admin" class="btn btn-primary btn-sm" :to="{ path: '/admin', query: { add: 1, brand: addBrand || undefined } }"><AppIcon name="plus" />Add product</RouterLink>
    </div>
    <p class="muted" style="font-size:14px;margin:0 0 14px">{{ list.length }} product{{ list.length === 1 ? "" : "s" }}</p>
    <div class="grid" v-if="list.length"><ProductCard v-for="p in list" :key="p._id" :p="p" /></div>
    <div class="empty" v-else>No products match that search.</div>
  </div>
</template>
