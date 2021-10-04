<template>
  <canvas ref="" />
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted, ref } from 'vue';
import colors from 'windicss/colors';
import { observableRef, bind } from '../context';
import Widget from './components/Widget.vue';
import { interval, map, Subscription } from 'rxjs';

export default defineComponent({
  setup() {
    const canvas = ref<HTMLCanvasElement>();
    const scopeSize = 30;
    const wave$ = bind(
      interval(25).pipe(
        map((index) => Math.sin(index / 5))
      )
    );
    const wave = observableRef<number>(wave$);

    const subscriber = ref<Subscription>();

    onMounted(() => {
      let context = canvas.value?.getContext('2d');
      let samples: number[] = new Array(scopeSize).fill(0);

      subscriber.value = wave$.subscribe((value) => {
        let width = canvas.value?.width || 0;
        let height = canvas.value?.height || 0;

        samples = [...samples.slice(1, scopeSize), value];

        if (context) {
          context.clearRect(0, 0, width as number, height as number);
          context.strokeStyle = colors.white as string;
          context.lineWidth = 3;

          context.beginPath();

          samples.forEach((sample, index) => {
            let x = ((width as number) / scopeSize) * index;
            let y = ((((sample * -1 + 1) / 2) * height) as number) * 0.9 + 3;
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
    });

    return {
      canvas,
      wave,
    }

  },
});
</script>
