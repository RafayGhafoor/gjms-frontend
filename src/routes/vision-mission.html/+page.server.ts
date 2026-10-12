import { getStats } from '$lib/server/stats';
import type { PageServerLoad } from './$types';

/* Runs at build time: only the derived counts reach the browser. */
export const load: PageServerLoad = () => ({ stats: getStats() });
