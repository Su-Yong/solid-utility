# solid-utility
Utility component, hooks or anything else for Solid JS

# Installation
- npm
```bash
npm install --save @suyongs/solid-utility
```

- yarn
```bash
yarn add @suyongs/solid-utility
```

## API
### Transition
- `Transition`: [Vue3](https://vuejs.org/guide/built-ins/transition.html#css-based-transitions) like Transition component
  - `name`: `[string]`, name of transition
  - `appear`: `[boolean]`, whether transition should be applied on initial render, default is `false`
  - `mode`: `in-out` `out-in`, default is `in-out`
  - `enterFromClass`: `[string]`, class name of enter from, default is `enter-from`
  - `enterActiveClass`: `[string]`, class name of enter active, default is `enter-active`
  - `enterToClass`: `[string]`, class name of enter to, default is `enter-to`
  - `leaveFromClass`: `[string]`, class name of leave from, default is `leave-from`
  - `leaveActiveClass`: `[string]`, class name of leave active, default is `leave-active`
  - `leaveToClass`: `[string]`, class name of leave to, default is `leave-to`
  - `onBeforeEnter`: `[(el: HTMLElement) => void]`, callback before enter
  - `onEnter`: `[(el: HTMLElement) => void]`, callback when enter
  - `onAfterEnter`: `[(el: HTMLElement) => void]`, callback after enter
  - `onBeforeLeave`: `[(el: HTMLElement) => void]`, callback before leave
  - `onLeave`: `[(el: HTMLElement) => void]`, callback when leave
  - `onAfterLeave`: `[(el: HTMLElement) => void]`, callback after leave

```tsx
import { Transition } from '@suyongs/solid-utility';

const Component = () => {
  const [show, setShow] = createSignal(true);

  return (
    <Transition name={'fade'}>
      <Show when={show()}>
        <div>hello world</div>
      </Show>
    </Transition>
  )
};
```

### Marquee

- `Marquee`: alternative for marquee tag
  - `speed`: `[number]`, move speed of marquee. pixel per seconds, default is `70`
  - `direction`: `left` `right` `up` `down`, default is `left`
  - `mode`: `auto` `scroll`, in `auto` mode, contents are scrolled when overflow its parent, `scroll` mode always scrolled, default is `auto`
  - `component`: `Component`, marquee can be any component, default is `div`
  ~~- [ ] `behavior`: TODO~~

```tsx
import { Marquee } from '@suyongs/solid-utility';

const Component = () => {

  return (
    <Marquee component={'a'} href={'https://github.com'}>
      if you want to make this marquee a tag, you should set component as a
    </Marquee>
  );
};
```
