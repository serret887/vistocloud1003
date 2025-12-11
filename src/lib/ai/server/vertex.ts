import { env } from '$env/dynamic/private';
import type { Citation, LenderResponse, Program } from '$lib/ai/types';
import { trackUsage } from './usage';

type Mode = 'single' | 'compare';

const config = {
	projectId: env.GCP_PROJECT_ID || 'demo-project',
	location: env.GCP_LOCATION || 'us-central1',
	model: env.VERTEX_CHAT_MODEL || 'gemini-1.5-flash',
	serviceAccount: env.GCP_SERVICE_ACCOUNT_JSON
};

async function getAccessToken() {
	if (!config.serviceAccount) return 'mock-token';
	const sa = JSON.parse(config.serviceAccount);
	const now = Math.floor(Date.now() / 1000);
	const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
	const payload = Buffer.from(JSON.stringify({
		iss: sa.client_email,
		sub: sa.client_email,
		aud: 'https://oauth2.googleapis.com/token',
		iat: now,
		exp: now + 3600,
		scope: 'https://www.googleapis.com/auth/cloud-platform'
	})).toString('base64url');
	const sign = (await import('crypto')).createSign('RSA-SHA256');
	sign.update(`${header}.${payload}`);
	const jwt = `${header}.${payload}.${sign.sign(sa.private_key, 'base64url')}`;
	const resp = await fetch('https://oauth2.googleapis.com/token', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt })
	});
	if (!resp.ok) return 'mock-token';
	const data = await resp.json();
	return data.access_token as string;
}

export async function callVertex(question: string, mode: Mode, programs: Program[], context: string, ids: { orgId: string; userId: string; conversationId?: string; lenders?: string[] }) {
	const token = await getAccessToken();
	if (token === 'mock-token') {
		return {
			content: `Mock answer for ${programs.join(', ')}: ${question}`,
			citations: [{ sourceName: 'Mock Guide', section: '1.1', snippet: 'Example snippet' } as Citation],
			lenderResponses: mode === 'compare' && ids.lenders?.length ? ids.lenders.map((id, i) => ({
				lenderId: id,
				lenderName: `Lender ${i + 1}`,
				eligibility: i ? 'conditional' : 'eligible',
				summary: 'Mock summary',
				details: 'Mock details',
				citations: []
			})) as LenderResponse[] : undefined
		};
	}

	const endpoint = `https://${config.location}-aiplatform.googleapis.com/v1/projects/${config.projectId}/locations/${config.location}/publishers/google/models/${config.model}:generateContent`;
	const resp = await fetch(endpoint, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
		body: JSON.stringify({
			contents: [{ role: 'user', parts: [{ text: context ? `${context}\n\n${question}` : question }] }],
			generationConfig: { temperature: 0.3, maxOutputTokens: 2048 }
		})
	});

	const data = await resp.json();
	const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
	const usage = data.usageMetadata || {};
	await trackUsage({
		orgId: ids.orgId,
		userId: ids.userId,
		conversationId: ids.conversationId,
		type: 'chat',
		service: 'vertex_ai_chat',
		inputTokens: usage.promptTokenCount || 0,
		outputTokens: usage.candidatesTokenCount || 0,
		totalTokens: (usage.promptTokenCount || 0) + (usage.candidatesTokenCount || 0)
	});

	return { content: text as string, citations: [] as Citation[], lenderResponses: undefined };
}


