<script setup>
import { computed } from "vue";
import { art } from "../lib/art";
import { hash } from "../lib/util";
const props = defineProps({ shape: String, seed: { type: String, default: "x" }, swatch: Array, cover: Boolean });
const svg = computed(() => {
  const s = art(props.shape || "bottle", props.swatch, hash(props.seed));
  return props.cover ? s.replace("<svg ", '<svg preserveAspectRatio="xMidYMid slice" style="width:100%;height:100%" ') : s;
});
</script>
<template><span class="artwrap" v-html="svg"></span></template>
