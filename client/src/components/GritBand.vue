<script setup>
import { useSite } from "../stores";
const site = useSite();
const grits = ["50", "100", "200", "400", "800", "1500", "3000"];
</script>
<template>
  <div class="grit">
    <div class="grit-img">
      <img v-if="site.assets.grit" :src="site.assets.grit" width="2400" height="720" alt="A terrazzo floor shown at each grit, from rough grinding at 50 to a mirror polish at 3000">
      <span class="grit-sheen" aria-hidden="true"></span>
    </div>
    <div class="labels"><span v-for="g in grits" :key="g">{{ g }}</span></div>
    <div class="grit-cap"><span>Every grit from first grind to mirror polish, in stock in Colombo.</span><RouterLink class="link" to="/range/abrasives">Grinding and polishing abrasives</RouterLink></div>
  </div>
</template>
