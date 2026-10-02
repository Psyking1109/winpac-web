<script setup>
import { useUi } from "../stores";
import AppIcon from "./AppIcon.vue";
const ui = useUi();
</script>
<template>
  <button class="iconbtn theme-toggle" type="button" @click="ui.toggleTheme()"
    :aria-label="ui.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
    :title="ui.theme === 'dark' ? 'Light mode' : 'Dark mode'">
    <AppIcon :name="ui.theme === 'dark' ? 'sun' : 'moon'" />
  </button>
</template>
