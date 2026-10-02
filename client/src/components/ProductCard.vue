<script setup>
import { computed } from "vue";
import { useSite, useEnquiry } from "../stores";
import ProductImage from "./ProductImage.vue";
import AppIcon from "./AppIcon.vue";
const props = defineProps({ p: { type: Object, required: true } });
const site = useSite(), enq = useEnquiry();
const b = computed(() => site.brand(props.p.brand));
const cat = computed(() => site.cat(props.p.category));
</script>
<template>
  <article class="card">
    <RouterLink class="ph" :to="`/product/${p.slug}`" tabindex="-1" aria-hidden="true"><ProductImage :p="p" /></RouterLink>
    <div class="body">
      <span class="brand">{{ b.name || cat.name }}</span>
      <h3><RouterLink :to="`/product/${p.slug}`">{{ p.name }}</RouterLink></h3>
      <p v-if="p.summary">{{ p.summary }}</p>
      <div class="foot">
        <span class="tag">{{ b.name ? cat.name : site.group(cat.group).name }}</span>
        <button class="addq" type="button" @click="enq.add(p.slug)" :aria-label="`Add ${p.name} to enquiry list`"><AppIcon name="plus" /></button>
      </div>
    </div>
  </article>
</template>
