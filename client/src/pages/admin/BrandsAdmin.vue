<script setup>
import { ref } from "vue";
import { useSite, useUi } from "../../stores";
import AppIcon from "../../components/AppIcon.vue";
import LogoField from "./LogoField.vue";
const site = useSite(), ui = useUi();
const editing = ref(null), saving = ref(false);
const open = b => { editing.value = b ? { ...JSON.parse(JSON.stringify(b)), tagsText: (b.tags || []).join(", ") } : { name: "", country: "", since: "", blurb: "", tagsText: "", url: "", logo: "" }; window.scrollTo(0, 0); };
async function save() {
  saving.value = true;
  try {
    const { tagsText, ...rest } = editing.value; rest.tags = tagsText.split(",").map(s => s.trim()).filter(Boolean);
    if (rest.url && !/^https?:\/\//.test(rest.url)) rest.url = "https://" + rest.url;
    await site.saveItem("brands", rest); editing.value = null; ui.toast("Brand saved");
  } catch (e) { ui.toast(e.message); } finally { saving.value = false; }
}
async function remove() { if (confirm(`Delete ${editing.value.name}?`)) { try { await site.removeItem("brands", editing.value); editing.value = null; ui.toast("Brand deleted"); } catch (e) { ui.toast(e.message); } } }
</script>
<template>
  <form v-if="editing" class="editor" @submit.prevent="save">
    <div class="edhead"><h3>{{ editing._id ? "Edit brand" : "Add brand" }}</h3><button type="button" class="btn btn-ghost btn-sm" @click="editing = null">Back to brands</button></div>
    <div class="field"><label>Logo</label><LogoField v-model="editing.logo" /></div>
    <div class="row3">
      <div class="field"><label for="b_n">Name</label><input id="b_n" v-model="editing.name" required></div>
      <div class="field"><label for="b_c">Country</label><input id="b_c" v-model="editing.country"></div>
      <div class="field"><label for="b_s">With WINPAC since</label><input id="b_s" v-model="editing.since" maxlength="10"></div>
    </div>
    <div class="field"><label for="b_b">About the brand</label><textarea id="b_b" v-model="editing.blurb"></textarea></div>
    <div class="field"><label for="b_t">Product areas</label><input id="b_t" v-model="editing.tagsText"><div class="hint">Separate with commas.</div></div>
    <div class="field"><label for="b_u">Website</label><input id="b_u" v-model="editing.url" placeholder="https://"></div>
    <div class="edfoot"><div style="display:flex;gap:10px"><button class="btn btn-primary" type="submit" :disabled="saving">Save brand</button><button type="button" class="btn btn-ghost" @click="editing = null">Cancel</button></div>
      <button v-if="editing._id" type="button" class="btn btn-danger" @click="remove">Delete brand</button></div>
  </form>
  <template v-else>
    <div class="toolbar"><h3 style="flex:1">Brands</h3><button class="btn btn-primary" type="button" @click="open(null)"><AppIcon name="plus" />Add brand</button></div>
    <div class="tablewrap"><table class="atable"><thead><tr><th>Logo</th><th>Name</th><th>Products</th><th></th></tr></thead><tbody>
      <tr v-for="b in site.brands" :key="b._id">
        <td style="width:130px"><img v-if="b.logo" :src="b.logo" alt="" style="height:36px;width:auto;max-width:110px;object-fit:contain"><span v-else class="muted" style="font-size:13px">No logo yet</span></td>
        <td><strong>{{ b.name }}</strong><div class="muted" style="font-size:12.5px">{{ b.country }}<template v-if="b.since"> · since {{ b.since }}</template></div></td>
        <td>{{ site.products.filter(p => p.brand === b.slug).length }}</td>
        <td class="act"><button class="btn btn-ghost btn-sm" type="button" @click="open(b)">Edit</button></td>
      </tr></tbody></table></div>
  </template>
</template>
