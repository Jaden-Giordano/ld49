<template>
  <div
    class="absolute min-w-64 min-h-32 box-border bg-gray-800 text-white inline-flex flex-col"
    :style="styles"
  >
    <div
      class="w-full px-2 py-1 bg-gray-900 cursor-pointer select-none"
      @mousedown="dragStart"
    >
      <span>{{title}}</span>
    </div>
    <div class="w-full flex flex-col p-2">
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";

type Position = {
  x: number;
  y: number;
};

type Props = {
  title: string;
};

export default defineComponent<Props>({
  props: {
    title: {
      type: String,
      default: () => 'Widget',
    },
  },
  setup() {
    const dragging = ref(false);
    const position = ref<Position>({ x: 0, y: 0 });
    const styles = computed(() => ({
      top: `${position.value.y}px`,
      left: `${position.value.x}px`,
    }));

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
    };
  },
});
</script>
