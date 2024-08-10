import { Accessor, createContext } from 'solid-js';

export interface FlowContextProps {
  beforeUpdate?: Accessor<unknown>;
  afterUpdate?: Accessor<unknown>;
}
export const FlowContext = createContext<FlowContextProps>({
  beforeUpdate: undefined,
  afterUpdate: undefined,
});
