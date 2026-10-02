<script setup>
import { ICONS } from "../lib/icons";
defineProps({ name: { type: String, required: true } });
</script>
<template><span class="ico" aria-hidden="true" v-html="ICONS[name]"></span></template>
