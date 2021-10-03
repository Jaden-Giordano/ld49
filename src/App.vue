<template>
  <div class="w-screen h-screen relative">
    <widget title="Power Source" :outputs="2" @output-connect="handleOutputConnect">
      <span>current value: {{wave}}</span>
    </widget>
    <widget title="Output" :inputs="1" @input-connect="handleInputConnect">
      <span>current value: 0</span>
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

    const handleOutputConnect = (index: number) => {
    };

    const handleInputConnect = (index: number) => {
    };

    return {
      wave,
      handleOutputConnect,
      handleInputConnect,
    };
  },
});
</script>

<style>
#app {
  font-family: Vector, Helvetica, Arial, sans-serif;
}
</style>
