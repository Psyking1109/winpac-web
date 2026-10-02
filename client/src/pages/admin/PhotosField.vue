<script setup>
import { ref } from "vue";
import { api } from "../../api";
import { resizeImage } from "../../lib/util";
import { useUi } from "../../stores";
import AppIcon from "../../components/AppIcon.vue";
const props = defineProps({ modelValue: { type: Array, default: () => [] }, max: { type: Number, default: 4 } });
const emit = defineEmits(["update:modelValue"]);
const ui = useUi(); const busy = ref(0);
async function add(e) {
  const files = [...e.target.files].slice(0, props.max - props.modelValue.length); e.target.value = "";
  for (const f of files) {
    busy.value++;
    try { const blob = await resizeImage(f, { max: 1200 }); const r = await api.upload(blob, "photo.jpg"); emit("update:modelValue", [...props.modelValue, r.url]); }
    catch (err) { ui.toast(err.message); }
    finally { busy.value--; }
  }
}
const remove = i => emit("update:modelValue", props.modelValue.filter((_, j) => j !== i));
const main = i => { const a = [...props.modelValue]; a.unshift(a.splice(i, 1)[0]); emit("update:modelValue", a); };
</script>
<template>
  <div class="edimgs">
    <div class="edimg" v-for="(src, i) in modelValue" :key="src">
      <img :src="src" :alt="`Photo ${i + 1}`"><span v-if="i === 0" class="mainbadge">Main</span>
      <div class="edimg-act"><button v-if="i > 0" type="button" @click="main(i)">Make main</button><button type="button" @click="remove(i)">Remove</button></div>
    </div>
    <div class="edimg" v-if="busy"><span class="muted" style="font-size:13px">Uploading…</span></div>
    <label class="edimg add" v-if="modelValue.length + busy < max">
      <input type="file" accept="image/jpeg,image/png,image/webp" multiple hidden @change="add">
      <AppIcon name="plus" /><span>Add photo{{ modelValue.length ? "" : "s" }}</span><small>JPG or PNG, up to {{ max }}</small>
    </label>
  </div>
</template>
