<script setup>
import { useSite } from "../stores";
import { tel, mailto, phoneList } from "../lib/util";
import AppIcon from "./AppIcon.vue";
const site = useSite();
</script>
<template>
  <section class="sec"><div class="wrap cta">
    <div><h2>Tell us the problem. We'll find the answer.</h2><p class="lede" style="margin-top:14px">Call us, email a photo of the surface, or visit our Colombo office.</p></div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <a class="btn btn-primary" :href="tel(site.company.mobile)"><AppIcon name="phone" />{{ site.company.mobile }}</a>
      <a v-for="n in phoneList(site.company.phones).slice(0, 1)" :key="n" class="btn btn-ghost" :href="tel(n)"><AppIcon name="phone" />{{ n }}</a>
      <a class="btn btn-ghost" :href="mailto(site.company.email, 'Enquiry')"><AppIcon name="mail" />Email us</a>
    </div>
  </div></section>
</template>
