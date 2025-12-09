import type { PageLoad } from './$types';

export const load: PageLoad = ({ url }) => ({
	prefill: url.searchParams.get('q') || null
});

