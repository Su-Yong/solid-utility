import { Accessor, createContext, createSignal } from 'solid-js';

import type { JSX } from 'solid-js/jsx-runtime';
import { captureState, DOMState } from '../state.ts';

export interface FlipContextProps {
  state: Accessor<Record<string, DOMState | null>>;
  getState: (id: string) => DOMState | null;
  getPrevState: (id: string) => DOMState | null;
  setState: (id: string, state: DOMState | null) => void;
  recordState: (id: string, element: Element) => void;
}

export const FlipContext = createContext<FlipContextProps>({
  state: () => ({}),
  getState: () => null,
  getPrevState: () => null,
  setState: () => {
  },
  recordState: () => {
  },
});

const { Provider: BaseFlipProvider } = FlipContext;

export interface FlipProviderProps {
  children: JSX.Element;
}

export const FlipProvider = (props: FlipProviderProps) => {
  const [state, setState] = createSignal<Record<string, DOMState | null>>({});
  const [prevState, setPrevState] = createSignal<Record<string, DOMState | null>>({});

  return (
    <BaseFlipProvider
      value={{
        state,
        getState: (id) => state()[id],
        getPrevState: (id) => prevState()[id],
        setState: (id, newState) => {
          // console.log('capture(set)', id);
          setPrevState((prev) => ({ ...prev, [id]: state()[id] }));
          setState((prev) => ({ ...prev, [id]: newState }));
        },
        recordState: (id, element) => {
          const newState = captureState(element);
          if (newState.rect.width === 0 && newState.rect.height === 0) return;

          // console.log('capture(record)', id);
          setPrevState((prev) => ({
            ...prev,
            [id]: state()[id],
          }));
          setState((prev) => ({
            ...prev,
            [id]: newState,
          }));
        },
      }}
    >
      {props.children}
    </BaseFlipProvider>
  );
};
