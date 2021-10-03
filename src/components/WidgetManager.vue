<template>
  <div class="w-full h-full relative">
    <widget
      v-for="widget in widgets"
      :key="widget.id"
      :title="widget.name"
      :state="widget.state"
      :inputs="widget.inputs.length"
      :outputs="widget.outputs.length"
    >
      <span>Something</span>
    </widget>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { uniqueId } from 'lodash';
import {
  interval,
  merge,
  Observable,
  share,
  Subject,
  Subscription,
} from 'rxjs';

import WidgetComponent from './Widget.vue';

interface IWidget<T = unknown> {
  id: string;
  name: string;
  stateSubject: Subject<T>;
  state: Observable<T | undefined>;
  inputs: Subscription[];
  outputs: Observable<T | undefined>[];
}

class Widget<T = unknown> implements IWidget<T> {
  id: string = uniqueId('widget-');
  name = 'Widget';
  stateSubject: Subject<T>;
  state: Observable<T | undefined>;
  inputs: Subscription[] = [];
  outputs: Observable<T | undefined>[] = [];

  constructor(name: string, init?: () => Observable<T>) {
    this.name = name;
    this.stateSubject = new Subject<T>();
    if (init) {
      this.state = merge(init(), this.stateSubject);
    } else {
      this.state = this.stateSubject;
    }

    this.outputs[0] = this.state.pipe(share());
  }

  attachInput(state: Observable<T | undefined>) {
    this.inputs.push(
      state.subscribe((value) => {
        if (value) this.stateSubject.next(value);
      })
    );
  }
}

export default defineComponent({
  components: {
    Widget: WidgetComponent,
  },
  setup() {
    const input = new Widget('Input', () => interval(500));
    const output = new Widget<number>('Output');
    output.attachInput(input.outputs[0]);
    const widgets = ref<Widget<any>[]>([input, output]);

    return { widgets };
  },
});
</script>
