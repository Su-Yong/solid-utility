import { createEffect, mergeProps, on, onCleanup, onMount, splitProps, useContext } from 'solid-js';

import { captureState } from './state';
import { FlipContext, FlowContext, NestedFlipContext, NestedFlipProvider } from './context';

import type { JSX } from 'solid-js/jsx-runtime';

export interface FlipProps {
  id: string;

  duration?: number;
  easing?: string;
  keyed?: boolean;

  children: JSX.Element;
}

export const Flip = (props: FlipProps) => {
  const { getState, setState, recordState } = useContext(FlipContext);
  const nested = useContext(NestedFlipContext);
  const flow = useContext(FlowContext);

  const [animationProps, local] = splitProps(
    mergeProps({
      duration: 300,
      easing: 'ease-in-out',
      keyed: false,
    }, props),
    ['duration', 'easing'],
  );

  let result: JSX.Element | null = null;
  const flip = () => {
    if (!(result instanceof Element)) {
      console.warn('Flip children must be a single DOM node', result);
      return;
    }

    const beforeState = getState(local.id);
    if (beforeState) {
      const prevParentState = nested?.prevParentState();
      const parentState = nested?.parentState();
      const afterState = captureState(result);
      setState(local.id, afterState);

      let parentDeltaX = 0;
      let parentDeltaY = 0;
      // let parentDeltaWidth = 1;
      // let parentDeltaHeight = 1;
      if (parentState && prevParentState) {
        const parentOffsetX = (prevParentState.rect.width - parentState.rect.width) / 2;
        const parentOffsetY = (prevParentState.rect.height - parentState.rect.height) / 2;
        parentDeltaX = prevParentState.rect.left - parentState.rect.left + parentOffsetX;
        parentDeltaY = prevParentState.rect.top - parentState.rect.top + parentOffsetY;
        // parentDeltaWidth = prevParentState.rect.width / parentState.rect.width;
        // parentDeltaHeight = prevParentState.rect.height / parentState.rect.height;
      }

      const offsetX = (beforeState.rect.width - afterState.rect.width) / 2;
      const offsetY = (beforeState.rect.height - afterState.rect.height) / 2;

      let deltaX = -1 * parentDeltaX + beforeState.rect.left - afterState.rect.left + offsetX;
      let deltaY = -1 * parentDeltaY + beforeState.rect.top - afterState.rect.top + offsetY;
      const deltaWidth = (beforeState.rect.width / afterState.rect.width);
      const deltaHeight = (beforeState.rect.height / afterState.rect.height);

      // console.log('flip', local.id, beforeState.rect, '->', afterState.rect);
      requestAnimationFrame(() => {
        if (!(result instanceof Element)) {
          console.warn('Flip children must be a single DOM node');
          return;
        }

        result.animate([
          {
            transformOrigin: '50% 50%',
            transform: `translate(${deltaX}px, ${deltaY}px) scale(${deltaWidth}, ${deltaHeight})`,
            backgroundColor: beforeState.color,
            opacity: beforeState.opacity,
          },
          {}
        ], {
          duration: animationProps.duration,
          easing: animationProps.easing,
        });
      });
    } else {
      recordState(local.id, result);
    }
  };

  onMount(() => {
    if (!(result instanceof Element)) {
      console.warn('Flip children must be a single DOM node');
      return;
    }

    if (!result.parentElement) return;
    flip();
  });

  createEffect(on(() => flow.beforeUpdate?.(), () => {
    if (!(result instanceof Element)) {
      console.warn('Flip children must be a single DOM node');
      return;
    }

    recordState(local.id, result);
  }, { defer: true }));
  createEffect(on(() => flow.afterUpdate?.(), () => {
    flip();
  }, { defer: true }));

  onCleanup(() => {
    if (!(result instanceof Element)) {
      console.warn('Flip children must be a single DOM node');
      return;
    }

    recordState(local.id, result);
  });

  return (
    <NestedFlipProvider id={local.id}>
      {result = props.children}
    </NestedFlipProvider>
  );
};
