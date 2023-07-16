import { Show, children, createEffect, createSignal, mergeProps, on, splitProps, startTransition } from 'solid-js';

import type { JSX } from 'solid-js';

type ResolvedJSXElement = Exclude<JSX.Element, JSX.ArrayElement>;
const yieldAsync = () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

export interface TransitionProps {
  name?: string;
  mode?: 'in-out' | 'out-in';
  appear?: boolean;

  onBeforeEnter?: (el: HTMLElement) => void;
  onEnter?: (el: HTMLElement) => void;
  onAfterEnter?: (el: HTMLElement) => void;
  onBeforeLeave?: (el: HTMLElement) => void;
  onLeave?: (el: HTMLElement) => void;
  onAfterLeave?: (el: HTMLElement) => void;

  enterFromClass?: string;
  enterActiveClass?: string;
  enterToClass?: string;
  leaveFromClass?: string;
  leaveActiveClass?: string;
  leaveToClass?: string;

  children?: JSX.Element;
}
const Transition = (props: TransitionProps) => {
  const [listeners, classes, leftProps] = splitProps(
    mergeProps(
      {
        appear: false,
        mode: 'in-out',
      },
      props,
    ),
    ['onBeforeEnter', 'onEnter', 'onAfterEnter', 'onBeforeLeave', 'onLeave', 'onAfterLeave'],
    ['enterFromClass', 'enterActiveClass', 'enterToClass', 'leaveFromClass', 'leaveActiveClass', 'leaveToClass'],
  );

  const childList = children(() => leftProps.children);
  const duplicatedChildList = children(() => leftProps.children);
  const firstChild = () => childList.toArray().at(0);
  const duplicatedFirstChild = () => duplicatedChildList.toArray().at(0);

  const [transition, setTransition] = createSignal(false);
  const [lastChild, setLastChild] = createSignal<ResolvedJSXElement | null>(duplicatedFirstChild());

  const enterFromClassName = () => classes.enterFromClass ?? `${leftProps.name}-enter-from`;
  const enterActiveClassName = () => classes.enterActiveClass ?? `${leftProps.name}-enter-active`;
  const enterToClassName = () => classes.enterToClass ?? `${leftProps.name}-enter-to`;
  const leaveFromClassName = () => classes.leaveFromClass ?? `${leftProps.name}-leave-from`;
  const leaveActiveClassName = () => classes.leaveActiveClass ?? `${leftProps.name}-leave-active`;
  const leaveToClassName = () => classes.leaveToClass ?? `${leftProps.name}-leave-to`;

  const onBeforeEnter = (element: HTMLElement) => {
    element.classList.add(enterFromClassName());
    element.classList.add(enterActiveClassName());
    listeners.onBeforeEnter?.(element);
  };
  const onEnter = (element: HTMLElement) => {
    element.classList.remove(enterFromClassName());
    element.classList.add(enterToClassName());

    listeners.onEnter?.(element);
  };
  const onAfterEnter = (element: HTMLElement) => {
    listeners.onAfterEnter?.(element);

    return () => {
      element.classList.remove(enterToClassName());
      element.classList.remove(enterActiveClassName());
    }
  };

  const onBeforeLeave = (element: HTMLElement | null) => {
    if (!element) return;

    element.classList.add(leaveFromClassName());
    element.classList.add(leaveActiveClassName());
    listeners.onBeforeLeave?.(element);
  };
  const onLeave = (element: HTMLElement | null) => {
    if (!element) return;

    element.classList.remove(leaveFromClassName());
    element.classList.add(leaveToClassName());

    listeners.onLeave?.(element);
  };
  const onAfterLeave = (element: HTMLElement | null) => {
    if (!element) return () => {};

    listeners.onAfterLeave?.(element);

    return () => {
      element.classList.remove(leaveToClassName());
      element.classList.remove(leaveActiveClassName());
    };
  };

  const runEnterTransition = async (element: HTMLElement, onFinally = () => {}) => {
    onBeforeEnter(element);

    await yieldAsync();

    const enterAfterListener = async () => {
      element.removeEventListener('animationend', enterAfterListener);
      element.removeEventListener('transitionend', enterAfterListener);
      element.removeEventListener('animationcancel', onFinally);
      element.removeEventListener('transitioncancel', onFinally);

      const cleanUp = onAfterEnter(element);

      cleanUp();
      onFinally();
    };
    
    onEnter(element);

    element.addEventListener('animationend', enterAfterListener);
    element.addEventListener('transitionend', enterAfterListener);
    element.addEventListener('animationcancel', onFinally);
    element.addEventListener('transitioncancel', onFinally);
  };
  const runLeaveTransition = async (element: HTMLElement, onFinally = () => {}) => {
    onBeforeLeave(element);

    await yieldAsync();

    const leaveAfterListener = async () => {
      element.removeEventListener('animationend', leaveAfterListener);
      element.removeEventListener('transitionend', leaveAfterListener);
      element.removeEventListener('animationcancel', onFinally);
      element.removeEventListener('transitioncancel', onFinally);

      const cleanUp = onAfterLeave(element);

      cleanUp();
      onFinally();
    };

    onLeave(element);

    element.addEventListener('animationend', leaveAfterListener);
    element.addEventListener('transitionend', leaveAfterListener);
    element.removeEventListener('animationcancel', onFinally);
    element.removeEventListener('transitioncancel', onFinally);
  };

  let isInit = false;
  createEffect(on(firstChild, async () => {
    if (!isInit && !leftProps.appear) {
      isInit = true;
      return;
    }

    const nowChild = firstChild();
    const beforeChild = lastChild();

    const onFinally = () => {
      startTransition(() => {
        setLastChild(duplicatedFirstChild());
        setTransition(false);
      });
    };

    if (leftProps.mode === 'in-out') {
      setTransition(true);
      if (nowChild instanceof HTMLElement) runEnterTransition(nowChild, onFinally);
      if (beforeChild instanceof HTMLElement) runLeaveTransition(beforeChild, onFinally);
    } else {
      setTransition(true);
      const onEnd = () => {
        setLastChild(duplicatedFirstChild());

        const newChild = lastChild();
        if (newChild instanceof HTMLElement) runEnterTransition(newChild, onFinally);
      };

      if (beforeChild instanceof HTMLElement) runLeaveTransition(beforeChild, onEnd);
      else onEnd();
    }
  }));

  return (
    <>
      <Show when={transition() && lastChild()}>
        {lastChild()}
      </Show>
      <Show when={leftProps.mode === 'in-out' || !transition()}>
        {firstChild()}
      </Show>
    </>
  );
};

export default Transition;
