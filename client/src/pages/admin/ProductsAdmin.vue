<script setup>
import { ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useSite, useUi } from "../../stores";
import { tokens, norm } from "../../lib/util";
import AppIcon from "../../components/AppIcon.vue";
import ProductImage from "../../components/ProductImage.vue";
import PhotosField from "./PhotosField.vue";
import PairsField from "./PairsField.vue";
const site = useSite(), ui = useUi(), route = useRoute(), router = useRouter();
const q = ref(""), fb = ref("");
const editing = ref(null), saving = ref(false);
const list = computed(() => { const t = tokens(q.value); return site.products.filter(p => (!fb.value || p.brand === fb.value) && t.every(x => norm(`${p.name} ${site.brand(p.brand).name} ${site.cat(p.category).name}`).includes(x))); });
function blank(brand) { const b = site.brand(brand); return { name: "", brand: brand || "", category: (site.categories[0] || {}).slug || "", origin: b.country || "", purposes: [], summary: "", description: "", features: [], specs: [], images: [], featured: false }; }
function open(p) { editing.value = p ? JSON.parse(JSON.stringify(p)) : blank(fb.value); editing.value.featuresText = (editing.value.features || []).join("\n"); window.scrollTo(0, 0); }
watch(() => route.query, qq => {
  if (qq.add) open(null), editing.value.brand = qq.brand || "", editing.value.origin = site.brand(qq.brand).country || "";
  else if (qq.edit) { const p = site.products.find(x => x._id === qq.edit); if (p) open(p); }
  if (qq.add || qq.edit) router.replace({ query: {} });
}, { immediate: true });
async function save() {
  const e = editing.value; if (!e.name.trim()) return;
  saving.value = true;
  try {
    const { featuresText, ...rest } = e;
    rest.features = featuresText.split("\n").map(s => s.trim()).filter(Boolean);
    rest.specs = (rest.specs || []).filter(s => s.label || s.value);
    const saved = await site.saveItem("products", rest);
    editing.value = null; ui.toast(`Saved. "${saved.name}" is live on the website.`);
  } catch (err) { ui.toast(err.message); } finally { saving.value = false; }
}
async function remove() {
  if (!confirm(`Delete "${editing.value.name}" from the website?`)) return;
  try { await site.removeItem("products", editing.value); editing.value = null; ui.toast("Product deleted"); } catch (err) { ui.toast(err.message); }
}
</script>
<template>
  <form v-if="editing" class="editor" @submit.prevent="save">
    <div class="edhead"><h3>{{ editing._id ? "Edit product" : "Add product" }}</h3><button type="button" class="btn btn-ghost btn-sm" @click="editing = null">Back to products</button></div>
    <div class="field"><label>Photos</label><PhotosField v-model="editing.images" /><div class="hint">The first photo is used on the product card. Photos are resized before upload so the site stays fast.</div></div>
    <div class="field"><label for="e_name">Product name</label><input id="e_name" v-model="editing.name" required maxlength="200"></div>
    <div class="row3">
      <div class="field"><label for="e_brand">Brand</label><select id="e_brand" v-model="editing.brand"><option value="">No brand (WINPAC)</option><option v-for="b in site.brands" :key="b.slug" :value="b.slug">{{ b.name }}</option></select></div>
      <div class="field"><label for="e_cat">Category</label><select id="e_cat" v-model="editing.category"><optgroup v-for="g in site.groups" :key="g.slug" :label="g.name"><option v-for="c in site.categories.filter(c => c.group === g.slug)" :key="c.slug" :value="c.slug">{{ c.name }}</option></optgroup></select></div>
      <div class="field"><label for="e_or">Made in</label><input id="e_or" v-model="editing.origin" list="origins" maxlength="60"><datalist id="origins"><option v-for="o in ['India','Sri Lanka','Vietnam','China','Spain','Italy']" :key="o" :value="o" /></datalist></div>
    </div>
    <div class="field"><label for="e_sum">Short description</label><input id="e_sum" v-model="editing.summary" maxlength="300"><div class="hint">One sentence, shown on the product card.</div></div>
    <div class="field"><label for="e_desc">Full description</label><textarea id="e_desc" v-model="editing.description" maxlength="8000"></textarea></div>
    <div class="field"><label for="e_feat">Key points</label><textarea id="e_feat" v-model="editing.featuresText" style="min-height:90px" placeholder="One per line"></textarea></div>
    <div class="field"><label>Details table</label><div class="hint" style="margin:0 0 8px">For example Grit / 60 to 3000, or Pack size / 5 L.</div><PairsField v-model="editing.specs" /></div>
    <div class="field"><label>Used for</label><div class="checks"><label v-for="u in site.purposes" :key="u.slug"><input type="checkbox" :value="u.slug" v-model="editing.purposes">{{ u.name }}</label></div></div>
    <div class="checks"><label><input type="checkbox" v-model="editing.featured">Feature on the home page</label></div>
    <div class="edfoot">
      <div style="display:flex;gap:10px"><button class="btn btn-primary" type="submit" :disabled="saving">{{ saving ? "Saving…" : "Save product" }}</button><button type="button" class="btn btn-ghost" @click="editing = null">Cancel</button></div>
      <button v-if="editing._id" type="button" class="btn btn-danger" @click="remove">Delete product</button>
    </div>
  </form>

  <template v-else>
    <div class="stat">
      <div><b>{{ site.products.length }}</b><span>Products</span></div>
      <div><b>{{ site.products.filter(p => (p.images || []).length).length }}</b><span>With photos</span></div>
      <div><b>{{ site.products.filter(p => p.featured).length }}</b><span>Featured</span></div>
      <div><b>{{ site.brands.length }}</b><span>Brands</span></div>
    </div>
    <div class="toolbar">
      <div class="search"><AppIcon name="search" /><label class="sr" for="aq">Find a product</label><input id="aq" v-model="q" type="search" placeholder="Find a product"></div>
      <label class="sr" for="afb">Brand</label><select id="afb" v-model="fb"><option value="">All brands</option><option v-for="b in site.brands" :key="b.slug" :value="b.slug">{{ b.name }}</option></select>
      <button class="btn btn-primary" type="button" @click="open(null)"><AppIcon name="plus" />Add product</button>
    </div>
    <div class="grid admin-grid" v-if="list.length">
      <article class="card" v-for="p in list" :key="p._id">
        <div class="ph"><ProductImage :p="p" /><span v-if="p.featured" class="origin">Featured</span></div>
        <div class="body"><span class="brand">{{ site.brand(p.brand).name || "No brand" }}</span><h3>{{ p.name }}</h3>
          <p>{{ site.cat(p.category).name }} · {{ (p.images || []).length ? (p.images.length + " photo" + (p.images.length > 1 ? "s" : "")) : "no photo" }}</p>
          <div class="foot" style="justify-content:flex-start"><button class="btn btn-ghost btn-sm" type="button" @click="open(p)">Edit</button><RouterLink class="btn btn-ghost btn-sm" :to="`/product/${p.slug}`">View</RouterLink></div></div>
      </article>
    </div>
    <div class="empty" v-else><h3 style="margin-bottom:8px">{{ site.products.length ? "No products match" : "Add your first product" }}</h3><p style="margin:0 auto 16px;max-width:44ch">Upload a photo and fill in the details. It appears as a card on its range page, and on its brand page if it has one.</p><button class="btn btn-primary" type="button" @click="open(null)"><AppIcon name="plus" />Add product</button></div>
  </template>
</template>
