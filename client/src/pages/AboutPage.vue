<script setup>
import { computed } from "vue";
import { useSite } from "../stores";
import CtaBlock from "../components/CtaBlock.vue";
import ClientLogos from "../components/ClientLogos.vue";
const site = useSite();
const c = computed(() => site.company);
</script>
<template>
  <div class="pagehead"><div class="wrap"><div class="crumbs"><RouterLink to="/">Home</RouterLink> / About</div><h2 style="font-size:clamp(30px,4vw,52px)">About {{ c.short || "WINPAC" }}</h2></div></div>
  <section class="sec-tight"><div class="wrap split">
    <p class="big">{{ c.motto }}</p>
    <div><p class="lede" style="color:var(--ink)">{{ c.about }}</p>
      <div class="vm"><div><h3>Vision</h3><p class="muted" style="margin-top:8px">{{ c.vision }}</p></div><div><h3>Mission</h3><p class="muted" style="margin-top:8px">{{ c.mission }}</p></div></div>
    </div>
  </div></section>
  <section class="sec-tight sunk" v-if="(c.timeline || []).length"><div class="wrap split">
    <h2>Since {{ c.est }}</h2>
    <ol class="timeline"><li v-for="t in c.timeline" :key="t.label + t.value"><b>{{ t.label }}</b>{{ t.value }}</li></ol>
  </div></section>
  <section class="sec-tight" v-if="(c.clients || []).length || (c.customers || []).length"><div class="wrap">
    <h2 style="margin-bottom:10px">Who we work with</h2>
    <p class="muted" style="margin-bottom:24px">Flooring installation and restoration contractors, industrial flooring specialists, and granite and marble factories. Among our customers:</p>
    <ClientLogos />
  </div></section>
  <CtaBlock />
</template>
