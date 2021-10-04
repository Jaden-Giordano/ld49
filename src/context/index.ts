import { DeepReadonly, onBeforeUnmount, readonly, ref } from 'vue';
import { Observable, share } from 'rxjs';

type ReadonlyRef<T = unknown> = {
  readonly value?: DeepReadonly<T>;
};

export function observableRef<T = unknown>(
  source$: Observable<T>
): ReadonlyRef {
  const reference = ref<T>();
  const sub = source$.subscribe((value) => {
    reference.value = value;
  });
  onBeforeUnmount(() => sub.unsubscribe());
  return readonly(reference);
}

export function bind<T = unknown>(source$: Observable<T>): Observable<T> {
  return source$.pipe(share());
}
