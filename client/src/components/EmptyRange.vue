<script setup>
import { useSite, useAuth } from "../stores";
import { tel, mailto } from "../lib/util";
import AppIcon from "./AppIcon.vue";
defineProps({ title: String, subject: String, addBrand: { type: String, default: "" } });
const site = useSite(), auth = useAuth();
</script>
<template>
  <div class="empty">
    <h3 style="margin-bottom:8px">{{ title }}</h3>
    <p style="margin:0 auto 16px;max-width:46ch">In the meantime, call or email us for the full range, prices and availability.</p>
    <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
      <RouterLink v-if="auth.admin" class="btn btn-primary btn-sm" :to="{ path: '/admin', query: { add: 1, brand: addBrand || undefined } }"><AppIcon name="plus" />Add product</RouterLink>
      <a class="btn btn-ghost btn-sm" :href="tel(site.company.mobile)"><AppIcon name="phone" />Call us</a>
      <a class="btn btn-ghost btn-sm" :href="mailto(site.company.email, subject)"><AppIcon name="mail" />Email us</a>
    </div>
  </div>
</template>
