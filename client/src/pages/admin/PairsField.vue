<script setup>
import AppIcon from "../../components/AppIcon.vue";
const props = defineProps({ modelValue: { type: Array, default: () => [] }, a: { type: String, default: "Label" }, b: { type: String, default: "Value" } });
const emit = defineEmits(["update:modelValue"]);
const set = (i, k, v) => emit("update:modelValue", props.modelValue.map((x, j) => j === i ? { ...x, [k]: v } : x));
</script>
<template>
  <div>
    <div class="specrow" v-for="(x, i) in modelValue" :key="i">
      <input :aria-label="a" :placeholder="a" :value="x.label" @input="set(i, 'label', $event.target.value)">
      <input :aria-label="b" :placeholder="b" :value="x.value" @input="set(i, 'value', $event.target.value)">
      <button type="button" class="btn btn-ghost btn-sm" aria-label="Remove row" @click="emit('update:modelValue', modelValue.filter((_, j) => j !== i))">&times;</button>
    </div>
    <button type="button" class="btn btn-ghost btn-sm" @click="emit('update:modelValue', [...modelValue, { label: '', value: '' }])"><AppIcon name="plus" />Add row</button>
  </div>
</template>
