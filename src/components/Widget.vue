<template>
  <div
    class="
      absolute
      min-w-64 min-h-32
      box-border
      bg-gray-800
      text-white
      inline-flex
      flex-col
    "
    :style="styles"
  >
    <div
      class="w-full px-2 py-1 bg-blue-800 cursor-pointer select-none"
      @mousedown="dragStart"
    >
      <span>{{ title }}</span>
    </div>
    <div class="w-full flex-grow flex">
      <div v-if="inputs" class="connectors">
        <div
          v-for="index in inputs"
          :key="index"
          ref="inputRef"
          class="connector"
          @click="$emit('input-connect', index)"
        />
      </div>
      <div class="flex-grow flex flex-col p-2">
        <graph :input$="state" />
        <span>VALUE: {{ stateRef }}</span>
      </div>
      <div v-if="outputs" class="connectors">
        <div
          v-for="index in outputs"
          :key="index"
          ref="outputRef"
          class="connector"
          @click="$emit('output-connect', index)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.connectors {
  @apply w-8;
  @apply flex flex-col justify-center items-center space-y-6;
  @apply bg-gray-700;
}

.connector {
  @apply w-4 h-4 box-border border-2 border-gray;
}
</style>

<script lang="ts">
import { observableRef } from '@/context';
import { Observable } from 'rxjs';
import { computed, defineComponent, ref } from 'vue';
import Graph from './Graph.vue';

type Position = {
  x: number;
  y: number;
};

type Props = {
  title: string;
  state?: Observable<any>;
  inputs?: number;
  outputs?: number;
};

export default defineComponent<Props>({
  components: {
    Graph,
  },
  props: {
    title: {
      type: String,
      default: () => 'Widget',
    },
    state: Object,
    inputs: Number,
    outputs: Number,
  },
  setup(props: Props) {
    const dragging = ref(false);
    const position = ref<Position>({ x: 0, y: 0 });
    const styles = computed(() => ({
      top: `${position.value.y}px`,
      left: `${position.value.x}px`,
    }));

    const stateRef = props.state ? observableRef<any>(props.state) : ref('');

    const lastPosition = ref<Position>({ x: 0, y: 0 });

    const dragStart = (event: MouseEvent) => {
      lastPosition.value = {
        x: event.clientX,
        y: event.clientY,
      };
      dragging.value = true;
      window.addEventListener('mousemove', dragMove);
      window.addEventListener('mouseup', dragEnd);
    };

    const dragMove = (event: MouseEvent) => {
      if (dragging.value) {
        const offsetX = lastPosition.value.x - event.clientX;
        const offsetY = lastPosition.value.y - event.clientY;
        lastPosition.value = {
          x: event.clientX,
          y: event.clientY,
        };
        position.value = {
          x: position.value.x - offsetX,
          y: position.value.y - offsetY,
        };
      }
    };

    const dragEnd = () => {
      dragging.value = false;
      window.removeEventListener('mousemove', dragMove);
      window.removeEventListener('mouseup', dragEnd);
    };

    return {
      styles,
      dragging,
      dragStart,
      dragMove,
      dragEnd,
      stateRef,
    };
  },
});
</script>
