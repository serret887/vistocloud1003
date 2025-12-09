import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/ai/server/firebase';
import { buildContext } from '$lib/ai/server/context';
import { callVertex } from '$lib/ai/server/vertex';
import type { Overlay, Program } from '$lib/ai/types';

export const POST: RequestHandler = async ({ locals, request }) => {
	const user = locals.user;
	const org = locals.org;
	if (!user || !org) throw error(401, 'unauthorized');

	const body = await request.json().catch(() => null);
	if (!body?.question) throw error(400, 'question required');

	const programs: Program[] = Array.isArray(body.programs) && body.programs.length ? body.programs : ['ALL'];
	const lenderIds: string[] = Array.isArray(body.lenderIds) ? body.lenderIds : [];
	const mode = body.mode === 'compare' && lenderIds.length ? 'compare' : 'single';
	const now = new Date();

	const convoId = body.conversationId || db.collection('conversations').doc().id;
	const convoRef = db.collection('conversations').doc(convoId);
	const excerpt = body.question.length > 100 ? body.question.slice(0, 100) + '...' : body.question;
	await convoRef.set(
		{
			id: convoId,
			orgId: org.id,
			userId: user.uid,
			title: body.question.slice(0, 80),
			excerpt,
			programs,
			lenderIds,
			createdAt: now,
			updatedAt: now,
			lastMessageAt: now
		},
		{ merge: true }
	);

	const msgRef = db.collection('messages').doc();
	await msgRef.set({
		id: msgRef.id,
		orgId: org.id,
		conversationId: convoId,
		userId: user.uid,
		role: 'user',
		content: body.question,
		programFilters: programs,
		lenderIds,
		createdAt: now
	});

	const overlaySnap = await db
		.collection('overlays')
		.where('orgId', '==', org.id)
		.where('program', 'in', Array.from(new Set([...programs, 'ALL'])))
		.get();
	const overlays = overlaySnap.docs.map((d): Overlay => d.data() as Overlay);

	const response = await callVertex(body.question, mode, programs, buildContext(body.question, overlays), {
		orgId: org.id,
		userId: user.uid,
		conversationId: convoId,
		lenders: lenderIds
	});

	const assistantRef = db.collection('messages').doc();
	await assistantRef.set({
		id: assistantRef.id,
		orgId: org.id,
		conversationId: convoId,
		role: 'assistant',
		content: response.content,
		programFilters: programs,
		lenderIds,
		citations: response.citations,
		...(response.lenderResponses && { lenderResponses: response.lenderResponses }),
		createdAt: new Date()
	});

	return json({
		conversationId: convoId,
		answer: response.content,
		citations: response.citations,
		lenderResponses: response.lenderResponses
	});
};

