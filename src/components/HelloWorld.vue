<script lang="ts">
import { defineComponent, ref } from 'vue'

type Props = {
  msg?: string;
};

export default defineComponent({
  props: {
    msg: String,
  },
  setup(props: Props) {
    const count = ref(0);
    return { count };
  },
});
</script>

<template>
  <h1>{{ msg }}</h1>
</template>
