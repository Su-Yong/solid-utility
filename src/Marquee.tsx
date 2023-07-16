import { Show, children, createEffect, createSignal, mergeProps, on, onCleanup, onMount, splitProps } from 'solid-js';

import type { JSX } from 'solid-js/jsx-runtime';
import { cx } from './utils/classNames';
import { createStyleSheet } from './utils/styles';

const useStyleSheet = createStyleSheet((className) => `
  .${className} {
    
    position: relative;
    white-space: nowrap;

    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    
    will-change: scroll-position;
    overflow: auto;
  }

  .${className} > .marquee {
    animation: marquee linear infinite;
    animation-duration: var(--duration, 10s);
  }

  @keyframes marquee {
    0% {
      transform: translateX(0%);
    }
    100% {
      transform: translateX(-100%);
    }
  }
`);

export interface MarqueeProps extends JSX.HTMLAttributes<HTMLDivElement> {
  children: JSX.Element;
  gap?: number;
  speed?: number;
}
const Marquee = (props: MarqueeProps) => {
  const [local, leftProps] = splitProps(mergeProps({ gap: 0, speed: 70 }, props), ['gap', 'speed']);
  const child1 = children(() => props.children);
  const child2 = children(() => props.children);

  const marqueeClassName = useStyleSheet();

  let dom!: HTMLDivElement;
  let ignore = false;
  const [useMarquee, setUseMarquee] = createSignal(false);
  const [scrollDuration, setScrollDuration] = createSignal(10000);

  const marqueeStyle = () => {
    console.log('scrollDuration', scrollDuration());
    if (typeof leftProps.style === 'string') {
      return `${leftProps.style}; overflow: hidden; --duration: ${scrollDuration()}ms;`;
    };
    
    return {
      ...leftProps.style,
      overflow: 'hidden',
      '--duration': `${scrollDuration()}ms`,
    }
  };

  const updateOverflow = () => {
    const { scrollWidth, clientWidth } = dom;

    const offset = useMarquee() ? 2 : 1;
    const gap = useMarquee() ? local.gap : 0;
    const newValue = (scrollWidth - gap) / offset > clientWidth;

    const shouldChange = !ignore;
    ignore = false;

    const duration = (scrollWidth / local.speed) * 1000;
    setScrollDuration(Number.isFinite(duration) ? duration : 10000);
    if (newValue !== useMarquee() && shouldChange) {
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

  createEffect(on(() => local.speed, () => {
    updateOverflow();
  }));

  onCleanup(() => {
    observer.disconnect();
  });

  return (
    <div
      {...leftProps}
      ref={dom}
      style={marqueeStyle()}
      class={cx(marqueeClassName, leftProps.class)}
    >
      <div
        class={`${useMarquee() ? 'marquee ignore' : ''}`}
        style={`padding-right: ${useMarquee() ? local.gap : 0}px`}
      >
        {child1()}
      </div>
      <Show when={useMarquee()}>
        <div
          class={'marquee'}
          style={`padding-right: ${local.gap}px`}
        >
          {child2()}
        </div>
      </Show>
    </div>
  );
};

export default Marquee;
