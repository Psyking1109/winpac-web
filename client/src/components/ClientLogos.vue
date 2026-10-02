<script setup>
import { computed } from "vue";
import { useSite } from "../stores";
const site = useSite();
const clients = computed(() => {
  const c = site.company.clients || [];
  return c.length ? c : (site.company.customers || []).map(name => ({ name, logo: "" }));
});
</script>
<template>
  <ul class="clients" v-if="clients.length">
    <li v-for="c in clients" :key="c.name + c.logo" :title="c.name">
      <img v-if="c.logo" :src="c.logo" :alt="c.name" loading="lazy">
      <span v-else>{{ c.name }}</span>
    </li>
  </ul>
</template>
