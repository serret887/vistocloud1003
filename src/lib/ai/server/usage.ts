import { db } from './firebase';

export async function trackUsage(record: Record<string, any>) {
	try {
		const ref = db.collection('usage').doc();
		await ref.set({ id: ref.id, ...record, createdAt: new Date() });
	} catch (error) {
		console.error('usage tracking failed', error);
	}
}

