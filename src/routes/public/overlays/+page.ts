import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	const res = await fetch('/api/ai/public/overlays');
	const data = await res.json();
	return data;
};

