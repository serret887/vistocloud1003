<script lang="ts">
	import {
		Select,
		SelectContent,
		SelectItem,
		SelectTrigger,
		SelectValue
	} from '$lib/components/ui/select';
	import { Globe } from 'lucide-svelte';
	import { cn } from '$lib/utils';

	export interface Language {
		code: string;
		name: string;
		flag?: string;
	}

	type Align = 'start' | 'end' | 'center';
	type Variant = 'outline' | 'ghost' | 'default';

	interface Props {
		languages: Language[];
		value?: string;
		align?: Align;
		variant?: Variant;
		onChange?: (value: string) => void;
		class?: string;
	}

	let { languages, value = $bindable(''), align = 'end', variant = 'outline', onChange, class: className }: Props = $props();

	function handleValueChange(newValue: string | undefined) {
		if (newValue) {
			value = newValue;
			onChange?.(newValue);
		}
	}

	// Map align to side for SelectContent
	const side = align === 'start' ? 'left' : align === 'end' ? 'right' : 'bottom';
</script>

<Select type="single" value={value} onValueChange={handleValueChange}>
	<SelectTrigger
		class={cn(
			'w-auto min-w-[140px]',
			variant === 'ghost' && 'border-none shadow-none',
			className
		)}
	>
		<div class="flex items-center gap-2">
			<Globe class="h-4 w-4" />
			<SelectValue placeholder="Select language" />
		</div>
	</SelectTrigger>
	<SelectContent side={side}>
		{#each languages as language}
			<SelectItem value={language.code}>
				<div class="flex items-center gap-2">
					{#if language.flag}
						<span class="text-lg">{language.flag}</span>
					{/if}
					<span>{language.name}</span>
				</div>
			</SelectItem>
		{/each}
	</SelectContent>
</Select>

