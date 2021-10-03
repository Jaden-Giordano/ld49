<template>
  <div class="w-screen h-screen relative">
    <widget-manager />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import WidgetManager from './components/WidgetManager.vue';

export default defineComponent({
  components: {
    WidgetManager,
  },
});
</script>

<style>
#app {
  @apply bg-gray-900;
  font-family: Vector, Helvetica, Arial, sans-serif;
}
</style>
