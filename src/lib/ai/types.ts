export type Program = 'ALL' | 'FHA' | 'VA' | 'CONV' | 'USDA' | 'NONQM';

export type Eligibility = 'eligible' | 'not_eligible' | 'conditional' | 'unknown';

export interface Citation {
	sourceName: string;
	section: string;
	url?: string;
	pageNumber?: number;
	snippet?: string;
	highlightText?: string;
}

export interface Message {
	id: string;
	orgId: string;
	conversationId: string;
	role: 'user' | 'assistant';
	content: string;
	programFilters: Program[];
	lenderIds?: string[];
	citations?: Citation[];
	lenderResponses?: LenderResponse[];
	createdAt: Date;
}

export interface Conversation {
	id: string;
	orgId: string;
	userId: string;
	title: string;
	excerpt?: string;
	favorite?: boolean;
	programs: Program[];
	lenderIds?: string[];
	createdAt: Date;
	updatedAt: Date;
	lastMessageAt: Date;
}

export interface LenderProgram {
	program: Program;
	isAvailable: boolean;
}

export interface Lender {
	id: string;
	orgId: string;
	name: string;
	logoUrl?: string;
	programs: LenderProgram[];
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface LenderOverlay {
	id: string;
	orgId: string;
	lenderId: string;
	program: Program;
	title: string;
	body: string;
}

export interface Overlay {
	id: string;
	orgId: string;
	program: Program;
	title: string;
	body: string;
	createdAt: Date;
}

export interface LenderResponse {
	lenderId: string;
	lenderName: string;
	eligibility: Eligibility;
	summary: string;
	details: string;
	citations: Citation[];
}

