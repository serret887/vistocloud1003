<script lang="ts">
	import { Button, Badge, Card, CardContent } from '$lib/components/ui';
	import {
		AlertDialog,
		AlertDialogAction,
		AlertDialogCancel,
		AlertDialogContent,
		AlertDialogDescription,
		AlertDialogFooter,
		AlertDialogHeader,
		AlertDialogTitle
	} from '$lib/components/ui';
	import { applicationStore } from '$lib/stores/application/index';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { _ } from 'svelte-i18n';

	let showCreateDialog = $state(false);

	const openCreateDialog = () => {
		showCreateDialog = true;
	};

	const createNewApplication = async () => {
		showCreateDialog = false;
		try {
			const id = await applicationStore.createApplication();
			toast.success($_('toast.applicationCreated'), { description: $_('toast.applicationCreatedDescription') });
			goto(`/application/${id}/client-info`);
		} catch (error) {
			toast.error($_('toast.applicationCreateFailed'), {
				description: error instanceof Error ? error.message : $_('toast.applicationCreateFailedDescription')
			});
		}
	};

	const stats = $derived([
		{ label: $_('home.stats.programsCovered'), value: '6+' },
		{ label: $_('home.stats.applicationsGenerated'), value: 'MISMO 3.4' },
		{ label: $_('home.stats.orgOverlaysModeled'), value: '100%' }
	]);

	const products = $derived([
		{
			title: $_('home.products.applicationGenerator.title'),
			subtitle: $_('home.products.applicationGenerator.subtitle'),
			description: $_('home.products.applicationGenerator.description'),
			features: [
				$_('home.products.applicationGenerator.features.workflow'),
				$_('home.products.applicationGenerator.features.dictation'),
				$_('home.products.applicationGenerator.features.validation'),
				$_('home.products.applicationGenerator.features.export'),
				$_('home.products.applicationGenerator.features.multiClient')
			],
			cta: $_('home.products.applicationGenerator.cta'),
			ctaAction: openCreateDialog,
			icon: '📋'
		},
		{
			title: $_('home.products.aiCopilot.title'),
			subtitle: $_('home.products.aiCopilot.subtitle'),
			description: $_('home.products.aiCopilot.description'),
			features: [
				$_('home.products.aiCopilot.features.overlayAware'),
				$_('home.products.aiCopilot.features.comparisons'),
				$_('home.products.aiCopilot.features.citations'),
				$_('home.products.aiCopilot.features.history'),
				$_('home.products.aiCopilot.features.intelligence')
			],
			cta: $_('home.products.aiCopilot.cta'),
			ctaAction: () => goto('/ai/app'),
			icon: '🤖'
		}
	]);

	const benefits = $derived([
		{
			title: $_('home.benefits.saveTime.title'),
			body: $_('home.benefits.saveTime.body')
		},
		{
			title: $_('home.benefits.reduceErrors.title'),
			body: $_('home.benefits.reduceErrors.body')
		},
		{
			title: $_('home.benefits.answerQuestions.title'),
			body: $_('home.benefits.answerQuestions.body')
		},
		{
			title: $_('home.benefits.scale.title'),
			body: $_('home.benefits.scale.body')
		}
	]);

	const howItWorks = $derived([
		{
			title: $_('home.howItWorks.step1.title'),
			body: $_('home.howItWorks.step1.body'),
			product: $_('home.howItWorks.step1.product')
		},
		{
			title: $_('home.howItWorks.step2.title'),
			body: $_('home.howItWorks.step2.body'),
			product: $_('home.howItWorks.step2.product')
		},
		{
			title: $_('home.howItWorks.step3.title'),
			body: $_('home.howItWorks.step3.body'),
			product: $_('home.howItWorks.step3.product')
		}
	]);

	const testimonials = $derived([
		{
			quote: $_('home.testimonials.testimonial1.quote'),
			author: $_('home.testimonials.testimonial1.author'),
			org: $_('home.testimonials.testimonial1.org')
		},
		{
			quote: $_('home.testimonials.testimonial2.quote'),
			author: $_('home.testimonials.testimonial2.author'),
			org: $_('home.testimonials.testimonial2.org')
		},
		{
			quote: $_('home.testimonials.testimonial3.quote'),
			author: $_('home.testimonials.testimonial3.author'),
			org: $_('home.testimonials.testimonial3.org')
		},
		{
			quote: $_('home.testimonials.testimonial4.quote'),
			author: $_('home.testimonials.testimonial4.author'),
			org: $_('home.testimonials.testimonial4.org')
		}
	]);
</script>

<div class="min-h-screen bg-background">

	<!-- Hero Section -->
	<section class="relative overflow-hidden bg-background py-24">
		<div class="absolute inset-0 opacity-30 blur-[120px]">
			<div class="mx-auto h-full w-5/6 bg-gradient-to-r from-primary/20 via-sky-500/10 to-indigo-800/20"></div>
		</div>
		<div class="relative z-10 mx-auto max-w-6xl px-6">
			<div class="text-center space-y-8 mb-16">
				<Badge variant="outline" class="bg-primary/10 text-primary shadow-sm">{$_('home.hero.badge')}</Badge>
				<h1 class="text-5xl md:text-6xl font-bold leading-tight text-foreground">
					{$_('home.hero.title').split('\n').map(line => line.trim()).join(' ')}
				</h1>
				<p class="text-xl text-muted-foreground max-w-3xl mx-auto">
					{$_('home.hero.subtitle')}
				</p>
				<div class="flex flex-wrap justify-center gap-4">
					<Button size="lg" class="px-8 text-base" onclick={openCreateDialog}>
						{$_('home.hero.start1003')} Application
					</Button>
					<Button size="lg" variant="outline" class="px-8 text-base" onclick={() => goto('/ai/app')}>
						{$_('home.hero.openAICopilot')}
					</Button>
				</div>
			</div>

			<div class="grid gap-4 sm:grid-cols-3 max-w-4xl mx-auto mb-16">
				{#each stats as stat, i (stat.label + i)}
					<div class="rounded-2xl border border-primary/10 bg-card/70 px-6 py-4 shadow-lg shadow-black/30 text-center">
						<p class="text-3xl font-bold text-foreground mb-1">{stat.value}</p>
						<p class="text-sm text-muted-foreground">{stat.label}</p>
					</div>
				{/each}
			</div>

			<div class="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground pt-8 border-t border-border">
				<span class="font-medium">{$_('home.trustedBy')}</span>
				<div class="flex flex-wrap gap-4 text-xs uppercase tracking-wider text-muted-foreground/80">
					<span>{$_('home.companies.arcadia')}</span>
					<span>{$_('home.companies.blueMesa')}</span>
					<span>{$_('home.companies.summitOps')}</span>
					<span>{$_('home.companies.homeFirst')}</span>
				</div>
			</div>
		</div>
	</section>

	<!-- Two Products Section -->
	<section class="bg-background py-24">
		<div class="mx-auto max-w-7xl px-6">
			<div class="text-center space-y-4 mb-16">
				<Badge variant="outline" class="bg-secondary text-secondary-foreground">{$_('home.products.badge')}</Badge>
				<h2 class="text-4xl font-bold text-foreground">{$_('home.products.title')}</h2>
				<p class="text-lg text-muted-foreground max-w-2xl mx-auto">
					{$_('home.products.subtitle')}
				</p>
			</div>

			<div class="grid gap-12 lg:grid-cols-2">
				{#each products as product (product.title)}
					<Card class="h-full border-2 hover:border-primary/50 transition-colors">
						<CardContent class="p-8 space-y-6">
							<div class="flex items-start gap-4">
								<div class="text-4xl">{product.icon}</div>
								<div class="flex-1">
									<Badge variant="outline" class="mb-2">{product.subtitle}</Badge>
									<h3 class="text-2xl font-bold text-foreground mb-2">{product.title}</h3>
									<p class="text-muted-foreground">{product.description}</p>
								</div>
							</div>
							
							<ul class="space-y-3">
								{#each product.features as feature}
									<li class="flex gap-3 text-sm text-muted-foreground">
										<span class="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0"></span>
										<span>{feature}</span>
									</li>
								{/each}
							</ul>

							<Button class="w-full" size="lg" onclick={product.ctaAction}>
								{product.cta}
							</Button>
						</CardContent>
					</Card>
				{/each}
			</div>
		</div>
	</section>

	<!-- Benefits Section -->
	<section class="bg-gradient-to-b from-accent/40 via-background to-background py-24">
		<div class="mx-auto max-w-6xl px-6">
			<div class="text-center space-y-4 mb-16">
				<Badge variant="outline" class="bg-secondary text-secondary-foreground">{$_('home.benefits.badge')}</Badge>
				<h2 class="text-4xl font-bold text-foreground">{$_('home.benefits.title')}</h2>
				<p class="text-lg text-muted-foreground max-w-2xl mx-auto">
					{$_('home.benefits.subtitle')}
				</p>
			</div>

			<div class="grid gap-6 md:grid-cols-2">
				{#each benefits as benefit (benefit.title)}
					<Card class="h-full border-muted shadow-sm">
						<CardContent class="p-6 space-y-3">
							<h3 class="text-xl font-semibold text-foreground">{benefit.title}</h3>
							<p class="text-muted-foreground">{benefit.body}</p>
						</CardContent>
					</Card>
				{/each}
			</div>
		</div>
	</section>

	<!-- How It Works Section -->
	<section class="bg-background py-24">
		<div class="mx-auto max-w-6xl px-6">
			<div class="text-center space-y-4 mb-16">
				<Badge variant="outline" class="bg-secondary text-secondary-foreground">{$_('home.howItWorks.badge')}</Badge>
				<h2 class="text-4xl font-bold text-foreground">{$_('home.howItWorks.title')}</h2>
			</div>

			<div class="grid gap-8 md:grid-cols-3">
				{#each howItWorks as step, index (step.title + index)}
					<div class="relative">
						<div class="rounded-2xl border border-muted bg-card/80 p-6 shadow-sm h-full">
							<div class="mb-4 flex items-center gap-3">
								<div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
									{index + 1}
								</div>
								<Badge variant="outline" class="text-xs">{step.product}</Badge>
							</div>
							<h3 class="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
							<p class="text-sm text-muted-foreground">{step.body}</p>
						</div>
						{#if index < howItWorks.length - 1}
							<div class="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-border"></div>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- AI Network Illustration Section -->
	<section class="bg-gradient-to-b from-background to-accent/20 py-24">
		<div class="mx-auto max-w-6xl px-6">
			<div class="text-center space-y-8 mb-12">
				<h2 class="text-3xl font-semibold text-foreground">{$_('home.aiNetwork.title')}</h2>
				<p class="text-muted-foreground max-w-3xl mx-auto">
					{$_('home.aiNetwork.subtitle')}
				</p>
			</div>
			
			<div class="flex justify-center py-8 mb-8">
				<img 
					src="/images/features-hero.svg" 
					alt="AI network illustration" 
					class="w-full max-w-md rounded-2xl shadow-lg" 
					loading="lazy"
				/>
			</div>
			
			<div class="max-w-2xl mx-auto space-y-6">
				<ul class="space-y-3 text-sm text-muted-foreground">
					<li class="flex gap-3">
						<span class="mt-1 h-2 w-2 rounded-full bg-primary"></span>
						<span>{$_('home.aiNetwork.features.compare')}</span>
					</li>
					<li class="flex gap-3">
						<span class="mt-1 h-2 w-2 rounded-full bg-primary"></span>
						<span>{$_('home.aiNetwork.features.toggle')}</span>
					</li>
					<li class="flex gap-3">
						<span class="mt-1 h-2 w-2 rounded-full bg-primary"></span>
						<span>{$_('home.aiNetwork.features.share')}</span>
					</li>
				</ul>
				<div class="flex justify-center gap-4">
					<Button variant="outline" class="px-6" onclick={() => goto('/ai/app')}>
						{$_('home.aiNetwork.cta')}
					</Button>
					<Button class="px-6" onclick={openCreateDialog}>
						{$_('home.hero.start1003')} Application
					</Button>
				</div>
			</div>
		</div>
	</section>

	<!-- Testimonials Section -->
	<section class="bg-secondary/40 py-24">
		<div class="mx-auto max-w-6xl space-y-10 px-6">
			<div class="text-center space-y-4">
				<Badge variant="outline" class="bg-secondary text-secondary-foreground">{$_('home.testimonials.badge')}</Badge>
				<h2 class="text-4xl font-bold text-foreground">{$_('home.testimonials.title')}</h2>
				<p class="text-lg text-muted-foreground max-w-2xl mx-auto">
					{$_('home.testimonials.subtitle')}
				</p>
			</div>
			<div class="grid gap-6 md:grid-cols-2">
				{#each testimonials as testimonial, i (testimonial.author + i)}
					<Card class="h-full border bg-card shadow-lg">
						<CardContent class="p-6">
							<p class="text-sm italic text-muted-foreground mb-4">"{testimonial.quote}"</p>
							<div class="pt-4 border-t border-border">
								<p class="text-sm font-semibold text-foreground">{testimonial.author}</p>
								<p class="text-xs uppercase tracking-wide text-muted-foreground">{testimonial.org}</p>
							</div>
						</CardContent>
					</Card>
				{/each}
			</div>
		</div>
	</section>

	<!-- Final CTA Section -->
	<section class="bg-background py-20">
		<div class="mx-auto flex max-w-4xl flex-col items-center gap-6 px-6 text-center">
			<Badge variant="outline" class="bg-primary/10 text-primary">{$_('home.finalCta.badge')}</Badge>
			<h2 class="text-4xl font-bold text-foreground">{$_('home.finalCta.title')}</h2>
			<p class="text-lg text-muted-foreground max-w-2xl">
				{$_('home.finalCta.subtitle')}
			</p>
			<div class="flex flex-wrap justify-center gap-4">
				<Button size="lg" class="px-8 text-base" onclick={openCreateDialog}>
					{$_('home.finalCta.start1003')}
				</Button>
				<Button size="lg" variant="outline" class="px-8 text-base" onclick={() => goto('/ai/app')}>
					{$_('home.finalCta.tryAICopilot')}
				</Button>
			</div>
			<p class="text-sm text-muted-foreground mt-4">
				{$_('home.finalCta.questions')} <a href="mailto:hello@vistocloud.com" class="text-primary hover:underline">{$_('home.finalCta.talkToTeam')}</a>
			</p>
		</div>
	</section>
</div>

<!-- Create Application Confirmation Dialog -->
<AlertDialog bind:open={showCreateDialog}>
	<AlertDialogContent>
		<AlertDialogHeader>
			<AlertDialogTitle>{$_('dialogs.createApplication.title')}</AlertDialogTitle>
			<AlertDialogDescription>
				{$_('dialogs.createApplication.description')}
			</AlertDialogDescription>
		</AlertDialogHeader>
		<AlertDialogFooter>
			<AlertDialogCancel onclick={() => { showCreateDialog = false; }}>
				{$_('dialogs.createApplication.cancel')}
			</AlertDialogCancel>
			<AlertDialogAction onclick={createNewApplication}>
				{$_('dialogs.createApplication.confirm')}
			</AlertDialogAction>
		</AlertDialogFooter>
	</AlertDialogContent>
</AlertDialog>
