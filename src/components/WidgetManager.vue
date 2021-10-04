<template>
  <div ref="el" class="w-full h-full relative">
    <button class="absolute right-2 top-2 btn" @click="handleAdd">Add</button>
    <canvas ref="canvas" class="absolute z-10 pointer-events-none" />
    <widget
      v-for="widget in widgets"
      :key="widget.id"
      :ref="(el) => assignRefs(widget.id, el)"
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
import {
  ComponentPublicInstance,
  computed,
  defineComponent,
  onBeforeUpdate,
  onMounted,
  reactive,
  ref,
  toRef,
  unref,
} from 'vue';
import { uniqueId } from 'lodash';
import {
  BehaviorSubject,
  interval,
  Observable,
  share,
  map,
  Subscription,
  OperatorFunction,
  pipe,
} from 'rxjs';

import WidgetComponent from './Widget.vue';
import colors from 'windicss/colors';

export type Position = {
  x: number;
  y: number;
};

export interface Connection {
  start: string;
  end: string;
  startPoint: Position;
  endPoint: Position;
}

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

  setModifier(operator: () => OperatorFunction<T | undefined, T | undefined>) {
    this.state = this.stateSubject.pipe(operator());
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

type ConnectionStore = {
  [key: string]: Connection;
};

export default defineComponent({
  components: {
    Widget: WidgetComponent,
  },
  setup() {
    const el = ref<HTMLDivElement>();
    const canvasWidth = computed<number>(() => el.value?.clientWidth || 0);
    const canvasHeight = computed<number>(() => el.value?.clientHeight || 0);
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
    const widgetRefs = ref<Record<string, HTMLDivElement>>({});
    const inputRefs = ref<Record<string, HTMLDivElement>>({});
    const outputRefs = ref<Record<string, HTMLDivElement>>({});
    const connectionStore = reactive<Connection[]>([]);

    const canvas = ref<HTMLCanvasElement>();

    const connecting = ref<string | undefined>();

    const assignRefs = (id: string, el: ComponentPublicInstance) => {
      if (el) {
        widgetRefs.value[id] = el.$el;
      }
    };

    onMounted(() => {
      if (canvas.value) {
        canvas.value.width = canvasWidth.value;
        canvas.value.height = canvasHeight.value;
        const context = canvas.value.getContext('2d');
        if (context) {
          const step = () => {
            context.clearRect(0, 0, canvasWidth.value, canvasHeight.value);
            connectionStore.forEach(({ startPoint, endPoint }) => {
              context.strokeStyle = 'white';
              context.lineWidth = 2;
              context.beginPath();
              context.moveTo(startPoint.x, startPoint.y);
              context.lineTo(endPoint.x, endPoint.y);
              context.stroke();
            });
            window.requestAnimationFrame(step);
          };
          window.requestAnimationFrame(step);
        }
      }
    });

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

          const connection = {
            start: inputWidget.id,
            end: outputWidget.id,
            startPoint: reactive({
              x: toRef(widgetRefs.value[inputWidget.id], 'offsetLeft'),
              y: toRef(widgetRefs.value[inputWidget.id], 'offsetTop'),
            }),
            endPoint: reactive({
              x: toRef(widgetRefs.value[outputWidget.id], 'offsetLeft'),
              y: toRef(widgetRefs.value[outputWidget.id], 'offsetTop'),
            }),
          } as Connection;

          connectionStore.push(connection);
        }
        connecting.value = undefined;
      }
    };

    const handleAdd = () => {
      const widget = new Widget<number>('Invert');
      widget.inputCount = 1;
      widget.outputCount = 1;
      widget.setModifier(() => pipe(
        map((value) => -(value || 0)),
      ));
      widgets.value[widget.id] = widget;
    };

    return {
      el,
      assignRefs,
      widgets,
      inputRefs,
      outputRefs,
      canvas,
      handleAdd,
      handleStartConnect,
      handleEndConnect,
    };
  },
});
</script>
