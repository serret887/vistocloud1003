import { twMerge } from 'tailwind-merge';
import type { Program } from '$lib/ai/types';

export const cn = (...classes: (string | false | null | undefined)[]) =>
	twMerge(classes.filter(Boolean).join(' '));

export const programLabels: Record<Program, string> = {
	ALL: 'All',
	FHA: 'FHA',
	VA: 'VA',
	CONV: 'Conventional',
	USDA: 'USDA',
	NONQM: 'Non-QM'
};


