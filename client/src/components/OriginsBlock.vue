<script setup>
import { computed } from "vue";
import { useSite } from "../stores";
import ProductArt from "./ProductArt.vue";
const site = useSite();
const SW = { "India": ["#F4F1EA", "#E8E4DA", "#FFFFFF", "#C9A27A", "#8C3B32"], "Sri Lanka": ["#EDEAE2", "#D6D2C6", "#C5C0B2", "#F7F5EF"], "Vietnam": ["#8D8A83", "#5E5B55", "#B3AFA6", "#1F1F1F"] };
const origins = computed(() => ["India", "Sri Lanka", "Vietnam"].map(o => {
  const list = site.products.filter(p => site.cat(p.category).group === "stones" && p.origin === o);
  const withPhoto = list.find(p => (p.images || []).length);
  return { o, list, photo: withPhoto && withPhoto.images[0] };
}));
</script>
<template>
  <div class="origins">
    <div class="orig" v-for="x in origins" :key="x.o">
      <div class="sw"><img v-if="x.photo" :src="x.photo" alt="" style="width:100%;height:100%;object-fit:cover"><ProductArt v-else :shape="x.o === 'Vietnam' ? 'pebbles' : 'chips'" :swatch="SW[x.o]" :seed="x.o" cover /></div>
      <h3>{{ x.o }}</h3>
      <ul>
        <li v-for="p in x.list" :key="p._id"><RouterLink :to="`/product/${p.slug}`">{{ p.name }}</RouterLink></li>
        <li v-if="!x.list.length" class="muted">Ask us about current stock</li>
      </ul>
    </div>
  </div>
</template>
