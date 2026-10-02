<script setup>
import { reactive, computed } from "vue";
import { useSite } from "../stores";
import { tel, mailto, phoneList } from "../lib/util";
import AppIcon from "../components/AppIcon.vue";
const site = useSite();
const c = computed(() => site.company);
const form = reactive({ n: "", c: "", p: "", m: "" });
function send() {
  const body = `Hello WINPAC,\n\n${form.m}\n\n${form.n}${form.c ? ` (${form.c})` : ""}${form.p ? `\n${form.p}` : ""}`;
  window.location.href = mailto(c.value.email, "Enquiry from the website", body);
}
</script>
<template>
  <div class="pagehead"><div class="wrap"><div class="crumbs"><RouterLink to="/">Home</RouterLink> / Contact</div><h2 style="font-size:clamp(30px,4vw,52px)">{{ c.tagline }}</h2><p class="lede" style="margin-top:10px">Call, email or visit our Colombo office. A photo of the surface helps us answer faster.</p></div></div>
  <div class="wrap contact-grid">
    <div>
      <div class="cline" v-if="c.mobile"><AppIcon name="phone" /><div><b>Mobile</b><a :href="tel(c.mobile)">{{ c.mobile }}</a></div></div>
      <div class="cline" v-if="phoneList(c.phones).length"><AppIcon name="phone" /><div><b>Office</b><span class="phones"><a v-for="n in phoneList(c.phones)" :key="n" :href="tel(n)">{{ n }}</a></span></div></div>
      <div class="cline" v-if="c.email"><AppIcon name="mail" /><div><b>Email</b><a :href="`mailto:${c.email}`">{{ c.email }}</a></div></div>
      <div class="cline" v-if="c.address"><AppIcon name="pin" /><div><b>Address</b><span class="cval">{{ c.address }}</span></div></div>
      <div class="cline" v-if="c.hours"><AppIcon name="clock" /><div><b>Opening hours</b><span class="cval">{{ c.hours }}</span></div></div>
    </div>
    <form class="form" @submit.prevent="send">
      <h3>Send us a message</h3>
      <div class="row2">
        <div class="field"><label for="cn">Your name</label><input id="cn" v-model="form.n" required autocomplete="name"></div>
        <div class="field"><label for="cc">Company</label><input id="cc" v-model="form.c" autocomplete="organization"></div>
      </div>
      <div class="field"><label for="cp">Phone</label><input id="cp" v-model="form.p" type="tel" autocomplete="tel"></div>
      <div class="field"><label for="cm">What do you need?</label><textarea id="cm" v-model="form.m" required placeholder="The surface, the problem and the area in square feet"></textarea></div>
      <div><button class="btn btn-primary" type="submit"><AppIcon name="mail" />Send by email</button></div>
    </form>
  </div>
</template>
