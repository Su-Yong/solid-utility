import type { ComponentProps, ValidComponent } from 'solid-js';
import {
  children,
  createEffect,
  createRenderEffect,
  createSignal,
  mergeProps,
  on,
  onCleanup,
  Show,
  splitProps
} from 'solid-js';
import { Dynamic } from 'solid-js/web';

import { createStyleSheet, cx, sx } from './utils';

import type { JSX } from 'solid-js/jsx-runtime';

const useStyleSheet = createStyleSheet((className) => `
  .${className} {
    position: relative;
    white-space: nowrap;

    display: flex;
    justify-content: flex-start;
    align-items: center;
    
    will-change: scroll-position;
    overflow: auto;
  }
  .${className}.left,
  .${className}.right {
    flex-direction: row;
  }
  
  .${className}.up,
  .${className}.down {
    flex-direction: column;
  }

  .${className} > .truncate {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .${className} > .marquee {
    animation-duration: var(--duration, 10s);
    animation-timing-function: linear;
    animation-iteration-count: infinite;
  }
  
  .${className}.left > .marquee {
    animation-name: marquee-left;
  }
  .${className}.right > .marquee {
    animation-name: marquee-right;
  }
  .${className}.up > .marquee {
    animation-name: marquee-up;
  }
  .${className}.down > .marquee {
    animation-name: marquee-down;
  }

  @keyframes marquee-left {
    0% {
      transform: translateX(0%);
    }
    100% {
      transform: translateX(-100%);
    }
  }
  @keyframes marquee-right {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(0%);
    }
  }
  @keyframes marquee-up {
    0% {
      transform: translateY(0%);
    }
    100% {
      transform: translateY(-100%);
    }
  }
  @keyframes marquee-down {
    0% {
      transform: translateY(-100%);
    }
    100% {
      transform: translateY(0%);
    }
  }
`);

export type MarqueeRef<T = HTMLElement> = T & {
  updateOverflow: () => void;
};
export type MarqueeProps<
  T extends ValidComponent,
  S1T extends ValidComponent = T,
  S2T extends ValidComponent = T,
  P = ComponentProps<T>,
  S1P = ComponentProps<T>,
  S2P = ComponentProps<T>
> = {
  [K in keyof P]: P[K];
} & Omit<JSX.HTMLAttributes<T>, 'ref'> & {
  ref?: (element: MarqueeRef) => void;

  component?: T;
  children: JSX.Element;

  mode?: 'auto' | 'scroll' | 'truncate' | 'hover' | 'force-hover';
  gap?: number;
  speed?: number;
  direction?: 'left' | 'right' | 'up' | 'down';

  // performance
  autoUpdate?: boolean;

  // For type checking
  style?: JSX.CSSProperties | string;
  class?: string;

  // headless
  slots?: {
    first?: S1T;
    second?: S2T;
  }
  slotProps?: {
    first?: JSX.HTMLAttributes<S1T> & {
      [K in keyof S1P]: S1P[K];
    };
    second?: JSX.HTMLAttributes<S2T> & {
      [K in keyof S2P]: S2P[K];
    };
  };
}
const Marquee = <
  T extends ValidComponent,
  S1T extends ValidComponent,
  S2T extends ValidComponent
>(props: MarqueeProps<T, S1T, S2T>) => {
  const [
    local,
    events,
    slots,
    leftProps,
  ] = splitProps(
    mergeProps({
      component: 'div',
      gap: 0,
      speed: 70,
      direction: 'left',
      mode: 'auto',
    }, props),
    ['mode', 'gap', 'speed', 'direction', 'component', 'autoUpdate'],
    ['onMouseEnter', 'onMouseLeave'],
    ['slots', 'slotProps']
  );
  const child1 = children(() => props.children);
  const child2 = children(() => props.children);

  /* signals */
  let ignore = false;
  const [dom, setDom] = createSignal<HTMLElement | null>(null);
  const [child, setChild] = createSignal<HTMLElement | null>(null);
  const [useMarquee, setUseMarquee] = createSignal(false);
  const [scrollDuration, setScrollDuration] = createSignal(10000);
  const [hover, setHover] = createSignal(false);

  /* computed */
  const isHorizontal = () => local.direction === 'left' || local.direction === 'right';
  const enableMarquee = () => {
    if (local.mode === 'scroll') return true;
    if (local.mode === 'force-hover') return hover();
    if (local.mode === 'hover') return hover() && useMarquee();
    if (local.mode === 'truncate') return false;
    if (local.mode === 'auto') return useMarquee();

    return false;
  };
  const enableTruncate = () => {
    if (local.mode === 'hover') return true;
    return local.mode === 'truncate';
  };

  /* defines */
  const marqueeClassName = useStyleSheet();

  /* lifecycle */
  const updateOverflow = () => {
    const domTarget = dom();
    if (!domTarget) return;

    const scrollValue = isHorizontal() ? domTarget.scrollWidth : domTarget.scrollHeight;
    const clientValue = isHorizontal() ? domTarget.clientWidth : domTarget.clientHeight;

    const offset = useMarquee() ? 2 : 1;
    const gap = useMarquee() ? local.gap : 0;
    const newValue = (scrollValue - gap) / offset > clientValue;

    const shouldChange = !ignore;
    ignore = false;

    const duration = (scrollValue / local.speed) * 1000;
    setScrollDuration(Number.isFinite(duration) ? duration : 10000);

    if (local.mode === 'auto' && newValue !== useMarquee() && shouldChange) {
      setUseMarquee(newValue);

      ignore = true;
    }
  };
  const observer = new MutationObserver(updateOverflow);

  createRenderEffect(() => {
    observer.disconnect();
    if (!local.autoUpdate) return;

    const target = dom()?.parentElement ?? dom();

    const limitTime = Date.now() + (3 * 1000);
    const tryComputedOverflow = () => {
      if (Date.now() > limitTime) return;

      requestAnimationFrame(() => {
        if ((dom()?.clientWidth ?? 0) === 0) {
          tryComputedOverflow();
        } else {
          updateOverflow();
          ignore = false;
        }
      });
    };
    tryComputedOverflow();

    if (target) {
      observer.observe(target, {
        characterData: true,
        childList: true,
        subtree: true,
        attributes: true,
      });
    }
  });

  createEffect(on([() => local.speed, () => local.direction], () => {
    updateOverflow();
  }));
  createEffect(() => {
    if (local.mode === 'scroll') {
      setUseMarquee(true);
    }
  });

  onCleanup(() => {
    observer.disconnect();
  });

  /* callbacks */
  const onMouseEnter = (event: MouseEvent) => {
    setHover(true);

    events.onMouseEnter?.(event);
  };
  const onMouseLeave = (event: MouseEvent) => {
    setHover(false);

    events.onMouseLeave?.(event);
  };

  return (
    <Dynamic
      {...leftProps}
      ref={(el: MarqueeRef) => {
        setDom(el);

        el.updateOverflow = updateOverflow;
        leftProps.ref?.(el);
      }}
      component={local.component as ValidComponent}
      style={sx(
        leftProps.style,
        {
          overflow: 'hidden',
          '--duration': `${scrollDuration()}ms`,
        },
        !isHorizontal() && {
          height: child() ? `${child()!.clientHeight}px` : 'auto',
        },
      )}
      class={cx(marqueeClassName, local.direction, leftProps.class)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Dynamic
        {...slots.slotProps?.first}
        component={slots.slots?.first?.component ?? local.component as ValidComponent}
        ref={setChild}
        class={cx(
          slots.slotProps?.first?.class,
          enableMarquee() && 'marquee ignore',
          enableTruncate() && 'truncate',
        )}
        style={sx(
          slots.slotProps?.first?.style,
          enableMarquee() && { 'padding-right': `${local.gap}px` },
        )}
      >
        {child1()}
      </Dynamic>
      <Show when={enableMarquee()}>
        <Dynamic
          {...slots.slotProps?.second}
          component={slots.slots?.second?.component ?? local.component as ValidComponent}
          class={cx('marquee', slots.slotProps?.second?.class)}
          style={sx(
            slots.slotProps?.second?.style,
            enableMarquee() && { 'padding-right': `${local.gap}px` },
          )}
        >
          {child2()}
        </Dynamic>
      </Show>
    </Dynamic>
  );
};

export default Marquee;
