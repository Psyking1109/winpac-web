<script setup>
import { ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useSite, useEnquiry, useUi } from "../stores";
import AppIcon from "./AppIcon.vue";
import ThemeToggle from "./ThemeToggle.vue";
const site = useSite(), enq = useEnquiry(), ui = useUi();
const route = useRoute(), router = useRouter();
const q = ref("");
function search() { router.push({ path: "/products", query: q.value.trim() ? { q: q.value.trim() } : {} }); q.value = ""; }
watch(() => route.fullPath, () => { ui.menuOpen = false; });
const links = [["/products", "All products"], ["/brands", "Brands"], ["/solutions", "Solutions"], ["/about", "About"], ["/contact", "Contact"]];
const active = to => route.path === to || (to === "/brands" && route.path.startsWith("/brand/")) || (to === "/products" && route.path.startsWith("/product/")) || (to === "/solutions" && route.path.startsWith("/solutions"));
</script>
<template>
  <header class="hdr">
    <div class="wrap hdr-in">
      <RouterLink class="logo" to="/">
        <img v-if="site.company.logo" :src="site.company.logo" :alt="site.company.name">
        <template v-else><span class="wm">{{ site.company.short || "WINPAC" }}</span><span class="sub">Trading Company<br>Since {{ site.company.est }}</span></template>
      </RouterLink>
      <nav class="nav" :class="{ open: ui.menuOpen }" id="nav" aria-label="Main">
        <RouterLink v-for="[to, label] in links" :key="to" :to="to" :aria-current="active(to) ? 'page' : null">{{ label }}</RouterLink>
      </nav>
      <form class="hsearch" role="search" @submit.prevent="search">
        <AppIcon name="search" /><label class="sr" for="hq">Search products</label>
        <input id="hq" v-model="q" type="search" placeholder="Search products">
      </form>
      <ThemeToggle />
      <button class="iconbtn" type="button" @click="enq.open = true" aria-label="Enquiry list">
        <AppIcon name="list" /><span class="badge" v-if="enq.count">{{ enq.count }}</span>
      </button>
      <button class="iconbtn menubtn" type="button" @click="ui.menuOpen = !ui.menuOpen" aria-label="Menu" aria-controls="nav" :aria-expanded="ui.menuOpen"><AppIcon name="menu" /></button>
    </div>
  </header>
  <nav class="rangebar" aria-label="Product ranges">
    <div class="wrap">
      <RouterLink v-for="g in site.groups" :key="g.slug" :to="`/range/${g.slug}`" :aria-current="route.path === `/range/${g.slug}` ? 'page' : null">{{ g.name }}</RouterLink>
    </div>
  </nav>
</template>
