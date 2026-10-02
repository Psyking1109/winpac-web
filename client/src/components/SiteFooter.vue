<script setup>
import { useSite } from "../stores";
import { tel, phoneList } from "../lib/util";
import AppIcon from "./AppIcon.vue";
const site = useSite();
const year = new Date().getFullYear();
</script>
<template>
  <footer class="ftr"><div class="wrap">
    <div class="ftr-grid">
      <div>
        <div class="logo flogo" style="margin-bottom:14px"><img v-if="site.company.logo" :src="site.company.logo" :alt="site.company.name"><span v-else class="wm">{{ site.company.short || "WINPAC" }}</span></div>
        <p class="muted" style="max-width:34ch">{{ site.company.motto }}</p>
        <p class="muted" style="margin:0">{{ site.company.address }}</p>
      </div>
      <div><h4>Ranges</h4><ul><li v-for="g in site.groups" :key="g.slug"><RouterLink :to="`/range/${g.slug}`">{{ g.name }}</RouterLink></li></ul></div>
      <div><h4>Brands</h4><ul><li v-for="b in site.brands" :key="b.slug"><RouterLink :to="`/brand/${b.slug}`">{{ b.name }}</RouterLink></li></ul></div>
      <div><h4>Contact</h4><ul>
        <li v-if="site.company.mobile"><a :href="tel(site.company.mobile)">{{ site.company.mobile }}</a> <span class="muted">(mobile)</span></li>
        <li v-for="n in phoneList(site.company.phones)" :key="n"><a :href="tel(n)">{{ n }}</a> <span class="muted">(office)</span></li>
        <li><a :href="`mailto:${site.company.email}`">{{ site.company.email }}</a></li>
        <li><RouterLink to="/contact">Visit us</RouterLink></li>
      </ul></div>
    </div>
    <div class="ftr-bot">
      <span>&copy; {{ year }} {{ site.company.name }}</span>
      <RouterLink class="staff" to="/admin" aria-label="Staff sign-in" title="Staff"><AppIcon name="lock" /></RouterLink>
    </div>
  </div></footer>
</template>
