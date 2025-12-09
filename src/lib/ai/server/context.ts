import type { Overlay } from '$lib/ai/types';

export function buildContext(question: string, overlays: Overlay[]) {
	let ctx = `Question: ${question}\n`;
	if (overlays.length) {
		ctx += '\nOverlays:\n';
		for (const o of overlays) ctx += `- ${o.program}: ${o.title} — ${o.body}\n`;
	}
	return ctx;
}

