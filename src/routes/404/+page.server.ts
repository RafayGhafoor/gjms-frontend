import { getStats } from '$lib/server/stats';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({ stats: getStats() });
