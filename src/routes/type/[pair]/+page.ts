import { PAIRINGS } from '$lib/data/type-pairings';

/* One prerendered page per pairing, plus the current site for reference:
   /type/1 … /type/5 and /type/current */

export const prerender = true;

export function entries() {
  return Object.keys(PAIRINGS).map((pair) => ({ pair }));
}
