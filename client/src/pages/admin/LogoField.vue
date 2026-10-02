<script setup>
import { ref } from "vue";
import { api } from "../../api";
import { resizeImage } from "../../lib/util";
import { useUi } from "../../stores";
defineProps({ modelValue: String, empty: { type: String, default: "No logo" } });
const emit = defineEmits(["update:modelValue"]);
const ui = useUi(); const busy = ref(false);
async function pick(e) {
  const f = e.target.files[0]; e.target.value = ""; if (!f) return;
  busy.value = true;
  try { const blob = await resizeImage(f, { max: 600, logo: true }); const r = await api.upload(blob, "logo.png"); emit("update:modelValue", r.url); }
  catch (err) { ui.toast(err.message); } finally { busy.value = false; }
}
</script>
<template>
  <div class="imgpick">
    <div class="prev logo-prev"><img v-if="modelValue" :src="modelValue" alt=""><span v-else class="muted" style="font-size:13px">{{ busy ? "Uploading…" : empty }}</span></div>
    <div style="display:grid;gap:8px">
      <label class="btn btn-ghost btn-sm" style="width:max-content">Upload logo<input type="file" accept="image/jpeg,image/png,image/webp" hidden @change="pick"></label>
      <button v-if="modelValue" type="button" class="btn btn-ghost btn-sm" @click="emit('update:modelValue', '')">Remove</button>
    </div>
  </div>
</template>
