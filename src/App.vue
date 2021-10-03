<template>
  <div class="w-screen h-screen relative">
    <widget title="A cool widget">
      <span>current value: {{wave}}</span>
    </widget>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { observableRef, bind } from './context';
import Widget from './components/Widget.vue';
import { interval, map } from 'rxjs';

export default defineComponent({
  components: {
    Widget,
  },
  setup() {
    const wave$ = bind(interval(500).pipe(
      map((index) => index % 2 == 1 ? -1 : 1),
    ));
    const wave = observableRef<number>(wave$);

    return { wave };
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
