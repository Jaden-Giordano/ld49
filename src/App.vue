<template>
  <div class="w-screen h-screen relative">
    <widget title="Power Source" :outputs="2" @output-connect="handleOutputConnect">
      <canvas ref="canvas"></canvas>
      <span>current value: {{(wave || 0).toFixed(3)}}</span>
    </widget>
    <widget title="Output" :inputs="1" @input-connect="handleInputConnect">
      <span>current value: 0</span>
    </widget>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted, ref } from 'vue'
import colors from 'windicss/colors';
import { observableRef, bind } from './context';
import Widget from './components/Widget.vue';
import { interval, map, Subscription } from 'rxjs';

export default defineComponent({
  components: {
    Widget,
  },
  setup() {
    const canvas = ref<HTMLCanvasElement>();
    const wave$ = bind(interval(25).pipe(
      //map((index) => index % 2 == 1 ? -1 : 1),
      map((index) => Math.sin(index / 5)),
    ));
    const wave = observableRef<number>(wave$);

    const subscriber = ref<Subscription>();

    const scopeSize = 30;

    const handleOutputConnect = (index: number) => {
    };

    const handleInputConnect = (index: number) => {
    };

    onMounted(() => {
      let context = canvas.value?.getContext('2d');
      let samples: number[] = new Array(scopeSize).fill(0);
      subscriber.value = wave$.subscribe((value) => {
        let width = canvas.value?.width || 0;
        let height = canvas.value?.height || 0 ;

        samples = [...samples.slice(1, scopeSize), value];



        if (context) {
          context.fillStyle = colors.gray[800];
          context.fillRect(0, 0, width as number, height as number);
          context.strokeStyle = colors.white as string;
          context.lineWidth = 3;

          context.beginPath();

          samples.forEach((sample, index) => {
            let x = (width as number / scopeSize) * index;
            let y = (((sample * -1) + 1) / 2) * height as number * 0.9 + 3;
            if (index == 0) {
              context?.moveTo(x, y);
              return;
            }
            context?.lineTo(x, y);

          });
              context?.stroke();
        }
      });
    });

    onUnmounted(() => {
      if (subscriber.value) {
        subscriber.value.unsubscribe();
      }
    })

    return {
      wave,
      handleOutputConnect,
      handleInputConnect,
      canvas,
    };
  },
});
</script>

<style>
#app {
  @apply bg-gray-900;
  font-family: Vector, Helvetica, Arial, sans-serif;
}
</style>
