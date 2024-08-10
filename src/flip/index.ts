import { For, Index } from './flow';
import { Flip as BaseFlip } from './Flip';

type Flip = typeof BaseFlip & {
  For: typeof For;
  Index: typeof Index;
};
(BaseFlip as Flip).For = For;
(BaseFlip as Flip).Index = Index;

export const Flip = BaseFlip as Flip;
export * from './context';
