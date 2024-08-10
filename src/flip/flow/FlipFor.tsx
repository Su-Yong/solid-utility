import {
  Accessor,
  batch,
  createEffect,
  createMemo,
  createSignal,
  DEV,
  getOwner,
  mapArray,
  on,
  runWithOwner
} from 'solid-js';
import { FlowContext } from '../context';

import type { JSX } from 'solid-js/jsx-runtime';

export const For = <T extends readonly any[], U extends JSX.Element>(props: {
  each: T | undefined | null | false;
  fallback?: JSX.Element;
  children: (item: T[number], index: Accessor<number>) => U;
}) => {
  const [each, setEach] = createSignal<T | undefined | null | false>(props.each, {
    equals: false,
  });
  const [beforeUpdate, setBeforeUpdate] = createSignal({});
  const [afterUpdate, setAfterUpdate] = createSignal({});

  const owner = getOwner();
  createEffect(on(() => props.each, () => {
    setBeforeUpdate({});

    queueMicrotask(() => {
      runWithOwner(owner, () => {
        batch(() => {
          setEach(() => props.each);
          setAfterUpdate({});
        });
      });
    });
  }));
  const fallback = 'fallback' in props && { fallback: () => props.fallback };

  return (
    <FlowContext.Provider value={{ beforeUpdate, afterUpdate }}>
      {
        (DEV
            ? createMemo(
              mapArray(each, props.children, fallback || undefined),
              undefined,
              { name: 'value' }
            )
            : createMemo(
              mapArray(each, props.children, fallback || undefined)
            )
        ) as unknown as JSX.Element
      }
    </FlowContext.Provider>
  );
};
