<template>
  <div class="w-full h-full relative">
    <button class="absolute right-2 top-2 btn" @click="handleAdd">Add</button>
    <widget
      v-for="widget in widgets"
      :key="widget.id"
      ref="widgetRefs[widget.id]"
      :title="widget.name"
      :state="widget.state"
      :inputs="widget.inputCount"
      :outputs="widget.outputCount"
      @input-connect="handleEndConnect(widget.id)"
      @output-connect="handleStartConnect(widget.id)"
    >
      <span>Something</span>
    </widget>
  </div>
</template>

<script lang="ts">
import { defineComponent, Ref, ref } from 'vue';
import { uniqueId } from 'lodash';
import {
  BehaviorSubject,
  interval,
  Observable,
  share,
  map,
  Subscription,
} from 'rxjs';

import WidgetComponent from './Widget.vue';

interface IWidget<T = unknown> {
  id: string;
  name: string;
  stateSubject: BehaviorSubject<T | undefined>;
  state: Observable<T | undefined>;
  inputs: Subscription[];
  inputCount: number;
  outputs: Observable<T | undefined>[];
  outputCount: number;
}

class Widget<T = unknown> implements IWidget<T> {
  id: string = uniqueId('widget-');
  name = 'Widget';
  stateSubject: BehaviorSubject<T | undefined>;
  state: Observable<T | undefined>;
  inputs: Subscription[] = [];
  inputCount = 0;
  outputs: Observable<T | undefined>[] = [];
  outputCount = 0;

  constructor(name: string, init?: () => Observable<T>) {
    this.name = name;
    this.stateSubject = new BehaviorSubject<T | undefined>(undefined);
    if (init) {
      this.state = init().pipe(
        share({
          connector: () => this.stateSubject,
        })
      );
    } else {
      this.state = this.stateSubject;
    }

    this.outputs[0] = this.state;
  }

  attachInput(state: Observable<T | undefined>) {
    this.inputs.push(
      state.subscribe((value) => {
        if (value) this.stateSubject.next(value);
      })
    );
  }
}

type WidgetStore = {
  [key: string]: Widget<any>;
};

export default defineComponent({
  components: {
    Widget: WidgetComponent,
  },
  setup() {
    const input = new Widget('Input', () =>
      interval(500).pipe(map((value) => (value % 2 === 1 ? -1 : 1)))
    );
    input.outputCount = 1;
    const output = new Widget<number>('Output');
    output.inputCount = 1;
    const widgets = ref<WidgetStore>({
      [input.id]: input,
      [output.id]: output,
    });
    const widgetRefs = ref<{ [key: string]: Ref<HTMLDivElement> }>({});

    const connecting = ref<string | undefined>();

    const handleStartConnect = (id: string) => {
      if (!connecting.value) {
        connecting.value = id;
      }
    };

    const handleEndConnect = (id = '') => {
      if (connecting.value) {
        const inputWidget = widgets.value[connecting.value || ''];
        const outputWidget = widgets.value[id];
        if (inputWidget && outputWidget) {
          outputWidget.attachInput(inputWidget.state);
        }
        connecting.value = undefined;
      }
    };

    const handleAdd = () => {
      const widget = new Widget<number>('Random');
      widget.inputCount = 1;
      widgets.value[widget.id] = widget;
    };

    return {
      widgets,
      widgetRefs,
      handleAdd,
      handleStartConnect,
      handleEndConnect,
    };
  },
});
</script>
