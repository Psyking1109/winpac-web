<script setup>
// Ranges, categories, solutions and purposes share one simple editor.
import { ref, computed } from "vue";
import { useSite, useUi } from "../../stores";
import AppIcon from "../../components/AppIcon.vue";
const props = defineProps({ col: { type: String, required: true } });
const site = useSite(), ui = useUi();
const META = {
  groups: { title: "Ranges", one: "range", hint: "The ranges shown in the bar under the menu. Put each category into a range under Categories.", blurb: true },
  categories: { title: "Categories", one: "category", blurb: true },
  audiences: { title: "Solutions", one: "solution", blurb: true, hint: "The \"Find what your work needs\" list. Each solution shows the products tagged with the purposes you tick." },
  purposes: { title: "Purposes", one: "purpose", hint: "The \"Used for\" tags you tick on each product." }
};
const m = computed(() => META[props.col]);
const items = computed(() => site[props.col]);
const shapes = ["frankfurt", "fickert", "pad", "disc", "wheel", "block", "sheet", "machine", "vacuum", "sander", "tub", "can", "bottle", "chips", "pebbles"];
const editing = ref(null), saving = ref(false);
const open = x => { editing.value = x ? JSON.parse(JSON.stringify(x)) : { name: "", blurb: "", group: (site.groups[0] || {}).slug, shape: "bottle", purposes: [], order: items.value.length }; window.scrollTo(0, 0); };
const used = x => props.col === "categories" ? site.products.filter(p => p.category === x.slug).length : props.col === "groups" ? site.products.filter(p => site.cat(p.category).group === x.slug).length : props.col === "purposes" ? site.products.filter(p => (p.purposes || []).includes(x.slug)).length : null;
async function save() { saving.value = true; try { await site.saveItem(props.col, editing.value); editing.value = null; ui.toast("Saved"); } catch (e) { ui.toast(e.message); } finally { saving.value = false; } }
async function remove() { if (confirm(`Delete this ${m.value.one}?`)) { try { await site.removeItem(props.col, editing.value); editing.value = null; ui.toast("Deleted"); } catch (e) { ui.toast(e.message); } } }
</script>
<template>
  <form v-if="editing" class="editor" @submit.prevent="save">
    <div class="edhead"><h3>{{ editing._id ? "Edit" : "Add" }} {{ m.one }}</h3><button type="button" class="btn btn-ghost btn-sm" @click="editing = null">Back to list</button></div>
    <div class="field"><label for="x_n">Name</label><input id="x_n" v-model="editing.name" required></div>
    <div class="field" v-if="m.blurb"><label for="x_b">Description</label><textarea id="x_b" v-model="editing.blurb" style="min-height:80px"></textarea></div>
    <div class="row2" v-if="col === 'categories'">
      <div class="field"><label for="x_g">Range</label><select id="x_g" v-model="editing.group"><option v-for="g in site.groups" :key="g.slug" :value="g.slug">{{ g.name }}</option></select><div class="hint">Which range in the top bar this category belongs to.</div></div>
      <div class="field"><label for="x_s">Drawing</label><select id="x_s" v-model="editing.shape"><option v-for="s in shapes" :key="s">{{ s }}</option></select></div>
    </div>
    <div class="field" v-if="col === 'audiences'"><label>Shows products used for</label><div class="checks"><label v-for="u in site.purposes" :key="u.slug"><input type="checkbox" :value="u.slug" v-model="editing.purposes">{{ u.name }}</label></div></div>
    <div class="field" style="max-width:160px"><label for="x_o">Order</label><input id="x_o" type="number" v-model.number="editing.order"><div class="hint">Lower numbers show first.</div></div>
    <div class="edfoot"><div style="display:flex;gap:10px"><button class="btn btn-primary" type="submit" :disabled="saving">Save</button><button type="button" class="btn btn-ghost" @click="editing = null">Cancel</button></div>
      <button v-if="editing._id" type="button" class="btn btn-danger" @click="remove">Delete</button></div>
  </form>
  <template v-else>
    <div class="toolbar"><h3 style="flex:1">{{ m.title }}</h3><button class="btn btn-primary" type="button" @click="open(null)"><AppIcon name="plus" />Add</button></div>
    <p v-if="m.hint" class="muted" style="margin:-6px 0 16px;font-size:14px">{{ m.hint }}</p>
    <div class="tablewrap"><table class="atable"><thead><tr><th>Name</th><th v-if="col !== 'audiences'">Products</th><th></th></tr></thead><tbody>
      <tr v-for="x in items" :key="x._id">
        <td><strong>{{ x.name }}</strong><div v-if="x.blurb" class="muted" style="font-size:12.5px;max-width:60ch">{{ x.blurb }}</div><div v-if="col === 'categories'" class="muted" style="font-size:12.5px">Range: {{ site.group(x.group).name || "none" }}</div></td>
        <td v-if="col !== 'audiences'">{{ used(x) }}</td>
        <td class="act"><button class="btn btn-ghost btn-sm" type="button" @click="open(x)">Edit</button></td>
      </tr></tbody></table></div>
  </template>
</template>
