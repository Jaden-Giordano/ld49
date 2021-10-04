<template>
  <canvas ref="canvas" />
</template>

<script lang="ts">
import {
  defineComponent,
  onMounted,
  onUnmounted,
  reactive,
  Ref,
  ref,
  toRefs,
} from 'vue';
import colors from 'windicss/colors';
import { observableRef, bind } from '../context';
import Widget from './components/Widget.vue';
import { interval, map, Observable, ObservableInput, Subscription } from 'rxjs';
type Props = {
  input$: Observable<number | undefined>;
};

function render(
  canvas: Ref<HTMLCanvasElement | undefined>,
  scopeState: { sample: number; scopeBuffer: number[] },
  scopeSize: number
) {
  let { sample, scopeBuffer } = toRefs(scopeState);

  let width = canvas.value?.width || 0;
  let height = canvas.value?.height || 0;

  scopeBuffer.value = [...scopeBuffer.value.slice(1, scopeSize), sample.value];

  let context = canvas.value?.getContext('2d');

  if (context) {
    context.clearRect(0, 0, width as number, height as number);
    context.strokeStyle = colors.white as string;
    context.lineWidth = 3;

    context.beginPath();

    scopeBuffer.value.forEach((sample, index) => {
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
}

export default defineComponent<Props>({
  props: {
    input$: Object,
  },
  setup(props: Props) {
    const canvas = ref<HTMLCanvasElement>();
    const sample = ref(0);
    const scopeSize = 50;

    const scopeState = reactive({
      sample,
      scopeBuffer: new Array(scopeSize).fill(0, 0, scopeSize),
    });

    const frameRate = 15;
    const subscriber = ref<Subscription>();

    onMounted(() => {
      let context = canvas.value?.getContext('2d');

      props.input$.subscribe((value) => {
        scopeState.sample = value || 0;
      });

      setInterval(() => {
        render(canvas, scopeState, scopeSize);
      }, 1000 / frameRate);
    });

    onUnmounted(() => {
      if (subscriber.value) {
        subscriber.value.unsubscribe();
      }
    });

    return {
      canvas,
    };
  },
});
</script>
