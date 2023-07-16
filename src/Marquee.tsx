import { Show, children, createEffect, createSignal, mergeProps, on, onCleanup, onMount, splitProps } from 'solid-js';
import { Dynamic } from 'solid-js/web';

import { cx } from './utils/classNames';
import { createStyleSheet } from './utils/styles';

import type { JSX } from 'solid-js/jsx-runtime';
import type { ValidComponent, ComponentProps } from 'solid-js';

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

export type MarqueeProps<T extends ValidComponent, P = ComponentProps<T>> = {
  [K in keyof P]: P[K];
} & JSX.HTMLAttributes<T> & {
  component?: T;
  children: JSX.Element;

  mode?: 'auto' | 'scroll';
  gap?: number;
  speed?: number;
  direction?: 'left' | 'right' | 'up' | 'down';

  // For type checking
  style?: JSX.CSSProperties | string;
  class?: string;
}
const Marquee = <T extends ValidComponent>(props: MarqueeProps<T>) => {
  const [local, leftProps] = splitProps(mergeProps({
    component: 'div',
    gap: 0,
    speed: 70,
    direction: 'left',
    mode: 'auto',
  }, props), ['mode', 'gap', 'speed', 'direction', 'component']);
  const child1 = children(() => props.children);
  const child2 = children(() => props.children);

  /* signals */
  let dom!: HTMLDivElement;
  let child!: HTMLDivElement;
  let ignore = false;
  const [useMarquee, setUseMarquee] = createSignal(false);
  const [scrollDuration, setScrollDuration] = createSignal(10000);

  /* defines */
  const marqueeClassName = useStyleSheet();
  const isHorizontal = () => local.direction === 'left' || local.direction === 'right';
  const marqueeStyle = () => {
    const value = child?.clientHeight ? `${child.clientHeight}px` : 'auto';
    if (typeof leftProps.style === 'string') {
      const options = isHorizontal() ? '' : `height: ${value};`;

      return `${leftProps.style}; overflow: hidden; --duration: ${scrollDuration()}ms;${options}`;
    };
    
    return {
      ...leftProps.style,
      overflow: 'hidden',
      height: isHorizontal() ? '' : `${value}`,
      '--duration': `${scrollDuration()}ms`,
    }
  };

  /* lifecycle */
  const updateOverflow = () => {
    const scrollValue = isHorizontal() ? dom.scrollWidth : dom.scrollHeight;
    const clientValue = isHorizontal() ? dom.clientWidth : dom.clientHeight;

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
  }
  const observer = new MutationObserver(updateOverflow);
  onMount(() => {
    const limitTime = Date.now() + (3 * 1000);
    const target = dom?.parentElement ?? dom;
    const tryComputedOverflow = () => {
      if (Date.now() > limitTime) return;

      requestAnimationFrame(() => {
        if (dom.clientWidth === 0) {
          tryComputedOverflow();
        } else {
          updateOverflow();
          ignore = false;
        }
      });
    };
    tryComputedOverflow();

    observer.observe(target, {
      characterData: true,
      childList: true,
      subtree: true,
      attributes: true,
    });
  });

  createEffect(on([() => local.speed, () => local.direction], () => {
    updateOverflow();
  }));
  createEffect(() => {
    if (local.mode === 'scroll') {
      setUseMarquee(true);
    }
  })

  onCleanup(() => {
    observer.disconnect();
  });

  return (
    <Dynamic
      {...leftProps}
      ref={dom}
      component={local.component as ValidComponent}
      style={marqueeStyle()}
      class={cx(marqueeClassName, local.direction, leftProps.class)}
    >
      <Dynamic
        component={local.component as ValidComponent}
        ref={child}
        class={`${useMarquee() ? `marquee ignore` : ''}`}
        style={`padding-right: ${useMarquee() ? local.gap : 0}px`}
      >
        {child1()}
      </Dynamic>
      <Show when={useMarquee()}>
        <Dynamic
          component={local.component as ValidComponent}
          class={'marquee'}
          style={`padding-right: ${local.gap}px`}
        >
          {child2()}
        </Dynamic>
      </Show>
    </Dynamic>
  );
};

export default Marquee;
