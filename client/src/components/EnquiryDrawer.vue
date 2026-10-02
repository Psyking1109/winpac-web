<script setup>
import { computed, watch, nextTick, ref } from "vue";
import { useSite, useEnquiry } from "../stores";
import { tel, mailto, phoneList } from "../lib/util";
import ProductImage from "./ProductImage.vue";
import AppIcon from "./AppIcon.vue";
const site = useSite(), enq = useEnquiry();
const panel = ref(null);
const rows = computed(() => enq.items.map(x => ({ ...x, p: site.product(x.slug) })).filter(x => x.p));
const message = computed(() => ["Hello WINPAC, I would like a quotation for:"].concat(rows.value.map(r => {
  const bn = site.brand(r.p.brand).name; return `- ${r.p.name}${bn ? ` (${bn})` : ""} x ${r.qty}`;
})).join("\n"));
watch(() => enq.open, o => { if (o) nextTick(() => panel.value && panel.value.querySelector("button").focus()); });
</script>
<template>
  <template v-if="enq.open">
    <div class="scrim" @click="enq.open = false"></div>
    <aside class="drawer" role="dialog" aria-label="Enquiry list" ref="panel" @keydown.esc="enq.open = false">
      <div style="display:flex;justify-content:space-between;align-items:center"><h3>Your enquiry list</h3><button class="btn btn-ghost btn-sm" @click="enq.open = false">Close</button></div>
      <template v-if="rows.length">
        <p class="muted" style="margin:8px 0 0;font-size:14px">Send the list to us and we will reply with prices and availability.</p>
        <div class="items">
          <div class="qitem" v-for="r in rows" :key="r.slug">
            <div class="th"><ProductImage :p="r.p" /></div>
            <div><div class="nm">{{ r.p.name }}</div><div class="muted" style="font-size:13px">{{ site.brand(r.p.brand).name || site.cat(r.p.category).name }}</div><button class="x" @click="enq.remove(r.slug)">Remove</button></div>
            <label><span class="sr">Quantity</span><input type="number" min="1" :value="r.qty" @input="enq.setQty(r.slug, $event.target.value)"></label>
          </div>
        </div>
        <div style="display:grid;gap:10px">
          <a class="btn btn-primary" :href="mailto(site.company.email, 'Quotation request', message)"><AppIcon name="mail" />Send by email</a>
          <a class="btn btn-ghost" :href="tel(site.company.mobile)"><AppIcon name="phone" />Call {{ site.company.mobile }}</a>
          <a v-for="n in phoneList(site.company.phones)" :key="n" class="btn btn-ghost" :href="tel(n)"><AppIcon name="phone" />Office {{ n }}</a>
        </div>
      </template>
      <div v-else class="items"><div class="empty">Your list is empty. Add products as you browse, then send them to us in one message.<br><br><RouterLink class="btn btn-primary btn-sm" to="/products" @click="enq.open = false">Browse products</RouterLink></div></div>
    </aside>
  </template>
</template>
