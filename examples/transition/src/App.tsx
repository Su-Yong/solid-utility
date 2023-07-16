import { Match, Show, Switch, createSignal } from 'solid-js';

import { Transition } from '@suyongs/solid-utility';

import './App.css';

function App() {
  const [show1, setShow1] = createSignal(false);
  const [show2, setShow2] = createSignal(false);
  const [mode, setMode] = createSignal<'in-out' | 'out-in'>('in-out');

  return (
    <div class={'container'}>
      <div class={'card'}>
        <div class={'card-title'}>
          Toggle Transition
        </div>
        <button onClick={() => setShow1(!show1())}>
          Toggle
        </button>
        <Transition name={'fade'}>
          <Show when={show1()}>
            <div class={'card'}>
              Transition Test
            </div>
          </Show>
        </Transition>
      </div>
      <div class={'card'}>
        <div class={'card-title'}>
          Change Transition
        </div>
        <label>
          <input type={'radio'} name={'mode'} checked={mode() === 'out-in'} onChange={() => setMode('out-in')} />
          out-in
        </label>
        <label>
          <input type={'radio'} name={'mode'} checked={mode() === 'in-out'} onChange={() => setMode('in-out')} />
          in-out
        </label>
        <button onClick={() => setShow2(!show2())}>
          Toggle
        </button>
        <Transition name={'fade'} mode={mode()}>
          <Switch>
            <Match when={show2()}>
              <div class={'card'}>
                show!
              </div>
            </Match>
            <Match when={!show2()}>
              <div class={'card'}>
                hide!
              </div>
            </Match>
          </Switch>
        </Transition>
      </div>
    </div>
  )
}

export default App
