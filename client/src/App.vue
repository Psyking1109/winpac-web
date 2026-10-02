<script setup>
import { onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useSite, useAuth, useUi } from "./stores";
import SiteHeader from "./components/SiteHeader.vue";
import SiteFooter from "./components/SiteFooter.vue";
import EnquiryDrawer from "./components/EnquiryDrawer.vue";
const site = useSite(), auth = useAuth(), ui = useUi(), route = useRoute();
const PREVIEW = !!import.meta.env.VITE_PREVIEW;
async function reset() { if (confirm("Reset the preview to the original products and details?")) (await import("./preview/mockApi.js")).resetPreview(); }
onMounted(() => { site.load(); auth.check(); });
watch(() => [route.fullPath, site.loaded], () => {
  const h = document.querySelector("main h1, main h2");
  const name = site.company.name || "WINPAC Trading Company";
  setTimeout(() => { const t = document.querySelector("main h1, main h2"); document.title = route.path === "/" || !t ? `${name} | Abrasives, machines, chemicals and aggregates` : `${t.textContent} | ${name}`; }, 50);
});
</script>
<template>
  <div v-if="PREVIEW" class="previewbar">Preview · not live yet. Changes you make are saved only in this browser. <button type="button" @click="reset">Reset preview</button></div>
  <a class="sr skip" href="#main">Skip to content</a>
  <SiteHeader />
  <main id="main" tabindex="-1">
    <div v-if="site.error && !site.loaded" class="wrap" style="padding-top:100px;padding-bottom:100px"><h2>The site couldn't load.</h2><p class="lede" style="margin-top:12px">Check your connection and refresh the page.</p></div>
    <div v-else-if="!site.loaded" class="wrap loading" style="padding-top:120px;padding-bottom:120px" aria-busy="true">Loading…</div>
    <RouterView v-else />
  </main>
  <SiteFooter v-if="site.loaded" />
  <EnquiryDrawer />
  <div v-if="ui.message" class="toast" role="status">{{ ui.message }}</div>
</template>
