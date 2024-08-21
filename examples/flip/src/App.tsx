import './App.css';
import { createSignal, Show } from 'solid-js';
import { Flip } from '../../../';

const shuffle = <T, >(array: T[]): T[] => [...array].map((value) => ({ value, sort: Math.random() }))
  .sort((a, b) => a.sort - b.sort)
  .map(({ value }) => value);

function App() {
  const [flip1, setFlip1] = createSignal(true);
  const [flip2, setFlip2] = createSignal([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  const [flip3, setFlip3] = createSignal<{
    id: number;
    items: number[];
  }[]>([
    { id: 1, items: [1, 2, 3] },
    { id: 2, items: [4, 5, 6] },
    { id: 3, items: [7, 8, 9] },
  ]);
  const [flip4, setFlip4] = createSignal(0);

  return (
    <div class={'container'}>
      <div class={'card'}>
        <div class={'card-title'}>
          Flip
        </div>
        <Show
          when={flip1()}
          fallback={
            <Flip id={'flip1'}>
              <div class={'flip1-end'} onClick={() => setFlip1(!flip1())}>
                Click again!
              </div>
            </Flip>
          }
        >
          <Flip id={'flip1'}>
            <div class={'flip1'} onClick={() => setFlip1(!flip1())}>
              Click!
            </div>
          </Flip>
        </Show>
      </div>
      <div class={'card'}>
        <div class={'card-title'}>
          Grid
        </div>
        <button
          onClick={() => setFlip2(shuffle(flip2()))}
        >
          flip
        </button>
        <div class={'grid'}>
          <Flip.For each={flip2()}>
            {(item) => (
              <Flip id={`flip2-${item}`}>
                <div class={'grid-item'}>
                  {item}
                </div>
              </Flip>
            )}
          </Flip.For>
        </div>
      </div>
      <div class={'card'}>
        <div class={'card-title'}>
          Nested Grid
        </div>
        <button
          onClick={() => setFlip3(shuffle(flip3().map((group) => ({ ...group, items: shuffle(group.items) }))))}
        >
          flip
        </button>
        <div
          class={'grid'}
          style={'--width: 300px;'}
        >
          <Flip.For each={flip3()}>
            {(item) => (
              <Flip id={`flip3-group-${item.id}`}>
                <div class={'grid-group'}>
                  <Flip.For each={item.items}>
                    {(subItem) => (
                      <Flip id={`flip3-${subItem}`}>
                        <div class={'grid-item'}>
                          {subItem}
                        </div>
                      </Flip>
                    )}
                  </Flip.For>
                </div>
              </Flip>
            )}
          </Flip.For>
        </div>
      </div>
      <div class={'card'}>
        <div class={'card-title'}>
          Nested Flip
        </div>
        <button
          onClick={() => setFlip4(flip4() + 1)}
        >
          count {flip4() + 1}
        </button>
        <Flip id={'flip4'}>
          <div class={`box ${flip4() % 3 === 0 ? 'red' : 'blue'}`}>
            Flip4 Outer
            <Flip id={'flip4-inner'}>
              <div class={`box ${flip4() % 2 === 0 ? 'red' : 'blue'}`}>
                Flip4 Inner
              </div>
            </Flip>
          </div>
        </Flip>
      </div>
    </div>
  );
}

export default App;
