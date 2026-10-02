<script setup>
import { ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useSite, useAuth, useUi } from "../../stores";
import ProductsAdmin from "./ProductsAdmin.vue";
import CompanyEditor from "./CompanyEditor.vue";
import BrandsAdmin from "./BrandsAdmin.vue";
import ListAdmin from "./ListAdmin.vue";
const PREVIEW = !!import.meta.env.VITE_PREVIEW;
const site = useSite(), auth = useAuth(), ui = useUi(), route = useRoute(), router = useRouter();
const tab = ref("products");
const tabs = computed(() => [
  ["products", "Products", site.products.length], ["company", "Company details", ""], ["brands", "Brands", site.brands.length],
  ["groups", "Ranges", site.groups.length], ["categories", "Categories", site.categories.length],
  ["audiences", "Solutions", site.audiences.length], ["purposes", "Purposes", site.purposes.length]
]);
watch(() => route.query, q => { if (q.add || q.edit) tab.value = "products"; }, { immediate: true });
const user = ref(""), pass = ref(""), err = ref(""), busy = ref(false);
async function login() {
  err.value = ""; busy.value = true;
  try { await auth.login(user.value, pass.value); pass.value = ""; ui.toast("Signed in"); }
  catch (e) { err.value = e.status === 429 ? e.message : "Wrong username or password."; }
  finally { busy.value = false; }
}
async function logout() { await auth.logout(); router.push("/"); }
</script>
<template>
  <div v-if="!auth.checked" class="wrap" style="padding-top:100px;padding-bottom:100px">Checking your access…</div>

  <div v-else-if="!auth.admin" class="wrap" style="padding-top:80px;padding-bottom:100px;max-width:460px">
    <h2>Staff sign-in</h2>
    <p class="muted" style="margin:10px 0 24px">For WINPAC staff who manage this website.</p>
    <p v-if="PREVIEW" class="notice" style="margin:-10px 0 20px">Preview: type any username and password to try the admin.</p>
    <form class="form" @submit.prevent="login">
      <div class="field"><label for="lu">Username</label><input id="lu" v-model="user" required autocomplete="username"></div>
      <div class="field"><label for="lp">Password</label><input id="lp" v-model="pass" type="password" required autocomplete="current-password"></div>
      <div role="alert" class="formerr">{{ err }}</div>
      <button class="btn btn-primary" type="submit" :disabled="busy">{{ busy ? "Signing in…" : "Sign in" }}</button>
    </form>
  </div>

  <template v-else>
    <div class="pagehead"><div class="wrap admin-head">
      <div><div class="crumbs">Admin · signed in as {{ auth.username }}</div><h2 style="font-size:clamp(28px,3.5vw,42px)">Manage the website</h2>
      <p class="lede" style="margin-top:8px">Every save goes live on the website straight away.</p></div>
      <button class="btn btn-ghost btn-sm" type="button" @click="logout">Sign out</button>
    </div></div>
    <div class="wrap admin">
      <div class="atabs" role="tablist">
        <button v-for="t in tabs" :key="t[0]" role="tab" type="button" :aria-selected="tab === t[0]" @click="tab = t[0]"><span>{{ t[1] }}</span><span>{{ t[2] }}</span></button>
      </div>
      <div>
        <ProductsAdmin v-if="tab === 'products'" />
        <CompanyEditor v-else-if="tab === 'company'" />
        <BrandsAdmin v-else-if="tab === 'brands'" />
        <ListAdmin v-else :col="tab" :key="tab" />
      </div>
    </div>
  </template>
</template>
