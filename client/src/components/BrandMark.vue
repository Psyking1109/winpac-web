<script setup>
defineProps({ b: { type: Object, required: true }, size: { type: String, default: "" } });
</script>
<template>
  <span class="bmark" :class="size">
    <img v-if="b.logo" :src="b.logo" :alt="`${b.name} logo`">
    <span v-else class="bword">{{ b.name }}</span>
  </span>
</template>
