import { Accessor, createContext, createMemo, useContext } from 'solid-js';

import { FlipContext } from './FlipContext';
import { DOMState } from '../state';

import type { JSX } from 'solid-js/jsx-runtime';

export interface NestedFlipContextProps {
  parentId: Accessor<string>;
  parentState: Accessor<DOMState | null>;
  prevParentState: Accessor<DOMState | null>;
}

export const NestedFlipContext = createContext<NestedFlipContextProps>();

export interface NestedFlipProviderProps {
  id: string;
  ref?: (element: JSX.Element) => void;
  children: JSX.Element;
}

export const NestedFlipProvider = (props: NestedFlipProviderProps) => {
  const { getState, getPrevState } = useContext(FlipContext);
  const parent = useContext(NestedFlipContext);

  const parentState = createMemo(() => {
    const state = getState(props.id);
    if (!state) return null;

    const parentState = parent?.parentState();

    return {
      ...state,
      rect: DOMRect.fromRect({
        x: state.rect.left + (parentState?.rect.left ?? 0),
        y: state.rect.top + (parentState?.rect.top ?? 0),
        width: state.rect.width,
        height: state.rect.height,
      }),
    };
  });
  const prevParentState = createMemo(() => {
    const state = getPrevState(props.id);
    if (!state) return null;

    const parentState = parent?.prevParentState();

    return {
      ...state,
      rect: DOMRect.fromRect({
        x: state.rect.left + (parentState?.rect.left ?? 0),
        y: state.rect.top + (parentState?.rect.top ?? 0),
        width: state.rect.width,
        height: state.rect.height,
      }),
    };
  });

  return (
    <NestedFlipContext.Provider
      value={{
        parentId: () => props.id,
        parentState,
        prevParentState,
      }}
    >
      {props.children}
    </NestedFlipContext.Provider>
  );
};
