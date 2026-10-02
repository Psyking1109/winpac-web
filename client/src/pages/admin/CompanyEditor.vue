<script setup>
import { ref } from "vue";
import { useSite, useUi } from "../../stores";
import LogoField from "./LogoField.vue";
import PairsField from "./PairsField.vue";
const site = useSite(), ui = useUi();
const c = ref({ clients: [], ...JSON.parse(JSON.stringify(site.company)), customersText: (site.company.customers || []).join(", ") });
const addClient = () => c.value.clients.push({ name: "", logo: "" });
const removeClient = i => c.value.clients.splice(i, 1);
const moveClient = (i, d) => { const a = c.value.clients, j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; };
const saving = ref(false);
async function save() {
  saving.value = true;
  try {
    const { customersText, ...company } = c.value;
    company.customers = customersText.split(",").map(s => s.trim()).filter(Boolean);
    company.clients = (company.clients || []).filter(x => x.name || x.logo);
    company.chemItems = (company.chemItems || []).filter(x => x.label); company.timeline = (company.timeline || []).filter(x => x.label);
    await site.saveSettings(company); ui.toast("Company details saved. The website is updated.");
  } catch (e) { ui.toast(e.message); } finally { saving.value = false; }
}
const F = [
  ["Contact", [["mobile", "Mobile"], ["phones", "Office phones (separate with /)"], ["email", "Email"], ["hours", "Opening hours"], ["address", "Address", "wide"]]],
  ["Home page", [["tagline", "Headline", "wide"], ["intro", "Introduction", "area"], ["chemTitle", "Chemicals section title"], ["stonesText", "Stones section text", "area"], ["chemText", "Chemicals section text", "area"]]],
  ["About page", [["name", "Company name"], ["est", "Established"], ["short", "Short name"], ["motto", "Motto"], ["about", "About", "area"], ["vision", "Vision", "area"], ["mission", "Mission", "area"]]]
];
</script>
<template>
  <form class="editor" @submit.prevent="save">
    <h3>Company details</h3>
    <div class="field"><label>Logo</label><LogoField v-model="c.logo" empty="Text logo" /></div>
    <template v-for="[head, fields] in F" :key="head">
      <h4 class="ahead">{{ head }}</h4>
      <div class="fieldgrid">
        <div class="field" v-for="[k, label, kind] in fields" :key="k" :class="{ wide: kind }">
          <label :for="`c_${k}`">{{ label }}</label>
          <textarea v-if="kind === 'area'" :id="`c_${k}`" v-model="c[k]"></textarea>
          <input v-else :id="`c_${k}`" v-model="c[k]">
        </div>
      </div>
      <div class="field" v-if="head === 'Home page'"><label>Chemicals section list</label><PairsField v-model="c.chemItems" a="Title" b="Short description" /></div>
      <template v-if="head === 'About page'">
        <div class="field"><label>History</label><PairsField v-model="c.timeline" a="Year" b="What happened" /></div>
        <div class="field"><label>Client logos</label><div class="hint" style="margin:0 0 10px">Shown on the home page ("Trusted by") and the About page.</div>
          <div class="clientrow" v-for="(cl, i) in c.clients" :key="i">
            <LogoField v-model="cl.logo" empty="No logo" />
            <input v-model="cl.name" placeholder="Client name" aria-label="Client name">
            <div class="clientbtns"><button type="button" class="btn btn-ghost btn-sm" @click="moveClient(i, -1)" aria-label="Move up">↑</button><button type="button" class="btn btn-ghost btn-sm" @click="moveClient(i, 1)" aria-label="Move down">↓</button><button type="button" class="btn btn-ghost btn-sm" @click="removeClient(i)">Remove</button></div>
          </div>
          <button type="button" class="btn btn-ghost btn-sm" @click="addClient">+ Add client</button>
        </div>
      </template>
    </template>
    <div><button class="btn btn-primary" type="submit" :disabled="saving">{{ saving ? "Saving…" : "Save company details" }}</button></div>
  </form>
</template>
