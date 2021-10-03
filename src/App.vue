<template>
  <div class="w-screen h-screen relative">
    <widget title="A cool widget">
      <span>content</span>
    </widget>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Widget from './components/Widget.vue';

export default defineComponent({
  components: {
    Widget,
  },
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
