import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/ai/server/firebase';

export const GET: RequestHandler = async () => {
	const overlaysSnap = await db.collection('overlays').where('isPublic', '==', true).limit(50).get();
	const lenderOverlaysSnap = await db.collection('lenderOverlays').where('isPublic', '==', true).limit(50).get();

	const overlays = overlaysSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
	const lenderOverlays = lenderOverlaysSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
	return json({ overlays, lenderOverlays });
};

