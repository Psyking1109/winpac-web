<script setup>
import { computed } from "vue";
import { useSite } from "../stores";
import ProductArt from "./ProductArt.vue";
const props = defineProps({ p: { type: Object, required: true }, index: { type: Number, default: 0 } });
const site = useSite();
const src = computed(() => (props.p.images || [])[props.index]);
const brand = computed(() => site.brand(props.p.brand));
</script>
<template>
  <img v-if="src" :src="src" :alt="p.name" loading="lazy">
  <span v-else class="nophoto">
    <img v-if="brand.logo" :src="brand.logo" alt="">
    <ProductArt v-else :shape="site.cat(p.category).shape" :seed="p.slug || 'new'" />
    <small>Photo coming soon</small>
  </span>
</template>
