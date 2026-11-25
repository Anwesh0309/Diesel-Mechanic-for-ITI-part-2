import { BlockDiagram } from './BlockDiagram';
import { BLOCKS } from './blockData';
import { Scene02, Scene05, Scene06, Scene07, Scene09 } from './custom';

/** Watch-stage visual for a unit and step: block diagram (1, 3, 4, 8, 10) or custom animated scene (2, 5, 6, 7, 9). */
export function Scene({ unit, step }: { unit: number; step: number }) {
  switch (unit) {
    case 2: return <Scene02 step={step} />;
    case 5: return <Scene05 step={step} />;
    case 6: return <Scene06 step={step} />;
    case 7: return <Scene07 step={step} />;
    case 9: return <Scene09 step={step} />;
    default: return BLOCKS[unit] ? <BlockDiagram def={BLOCKS[unit]} step={step} /> : null;
  }
}
