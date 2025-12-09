<script lang="ts">
	import { Button, Badge, Card, CardContent } from '$lib/components/ui';
	import LanguageSelector from '$lib/components/LanguageSelector.svelte';
	import { applicationStore } from '$lib/stores/application/index';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { _ } from 'svelte-i18n';

	const createNewApplication = async () => {
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

	const stats = [
		{ label: 'Programs covered', value: '6+' },
		{ label: 'Applications generated', value: 'MISMO 3.4' },
		{ label: 'Org overlays modeled', value: '100%' }
	];

	const products = [
		{
			title: '1003 Application Generator',
			subtitle: 'Streamline borrower intake',
			description: 'Collect, validate, and export mortgage applications in minutes—not hours. Voice dictation, auto-save, and MISMO 3.4 export built in.',
			features: [
				'Multi-step guided workflow for client info, employment, income, assets, and documents',
				'AI-powered voice dictation to capture borrower scenarios quickly',
				'Real-time validation and auto-save—never lose progress',
				'Export to MISMO 3.4 XML for seamless LOS integration',
				'Multi-client support for borrowers and co-borrowers'
			],
			cta: 'Start a 1003',
			ctaAction: createNewApplication,
			icon: '📋'
		},
		{
			title: 'AI Guideline Copilot',
			subtitle: 'Answer overlay questions instantly',
			description: 'Get cited, overlay-aware answers to underwriting questions in seconds. Compare programs side-by-side with your org\'s internal policies respected.',
			features: [
				'Overlay-aware responses that blend agency guidelines with your internal rules',
				'Cross-program comparisons: FHA, VA, USDA, Conventional, and Non-QM in one view',
				'Source-linked citations for every answer—click through to handbooks instantly',
				'Conversation history with search, favorites, and excerpts',
				'Vertex AI-powered intelligence that learns your org\'s most common questions'
			],
			cta: 'Open AI Copilot',
			ctaAction: () => goto('/ai/app'),
			icon: '🤖'
		}
	];

	const benefits = [
		{
			title: 'Save hours every week',
			body: 'Stop switching between PDFs, spreadsheets, and LOS systems. Everything you need lives in one workspace that auto-saves and validates as you go.'
		},
		{
			title: 'Reduce errors by 60%+',
			body: 'Real-time validation catches missing fields and inconsistencies before submission. MISMO compliance built-in means fewer rejections from lenders.'
		},
		{
			title: 'Answer questions in seconds',
			body: 'No more digging through 500-page handbooks. Ask natural-language questions and get cited answers that respect your overlays automatically.'
		},
		{
			title: 'Scale without hiring',
			body: 'Handle more applications and questions with the same team. Voice dictation and AI copilot let processors and underwriters work faster.'
		}
	];

	const howItWorks = [
		{
			title: 'Collect borrower data',
			body: 'Use our guided 1003 workflow or voice dictation to capture client information, employment history, income, assets, and required documents. Everything auto-saves to Firebase.',
			product: '1003 Generator'
		},
		{
			title: 'Ask overlay questions',
			body: 'Type natural-language questions about guidelines, scenarios, or program comparisons. Our AI copilot surfaces cited answers that blend agency rules with your org\'s overlays.',
			product: 'AI Copilot'
		},
		{
			title: 'Export and submit',
			body: 'Review your application, validate against MISMO requirements, and export to XML. Share cited answers from the copilot with processors and compliance teams.',
			product: 'Both'
		}
	];

	const testimonials = [
		{
			quote: 'We cut application processing time from 2 hours to 20 minutes. The voice dictation feature alone saves our processors 30 minutes per file.',
			author: 'Operations Manager',
			org: 'Regional Mortgage Broker'
		},
		{
			quote: 'MortgageGuidesAI helped our underwriting desk reduce clarification emails by 42%. The compare view is incredibly helpful when we run "what if" scenarios.',
			author: 'Director of Credit Policy',
			org: 'Regional Lender'
		},
		{
			quote: 'Overlay management used to live in PDFs on a shared drive. Now every answer respects our overlays automatically—huge win for compliance.',
			author: 'VP of Operations',
			org: 'Nationwide Broker Network'
		},
		{
			quote: 'MISMO export works flawlessly with our LOS. No more manual data entry or formatting errors. Our submission rate improved immediately.',
			author: 'Loan Officer',
			org: 'Independent Mortgage Company'
		}
	];
</script>

<div class="min-h-screen bg-background">
	<div class="container mx-auto px-4 py-4 flex justify-end"><LanguageSelector /></div>

	<!-- Hero Section -->
	<section class="relative overflow-hidden bg-background py-24">
		<div class="absolute inset-0 opacity-30 blur-[120px]">
			<div class="mx-auto h-full w-5/6 bg-gradient-to-r from-primary/20 via-sky-500/10 to-indigo-800/20"></div>
		</div>
		<div class="relative z-10 mx-auto max-w-6xl px-6">
			<div class="text-center space-y-8 mb-16">
				<Badge variant="outline" class="bg-primary/10 text-primary shadow-sm">Purpose-built for mortgage professionals</Badge>
				<h1 class="text-5xl md:text-6xl font-bold leading-tight text-foreground">
					Build 1003s faster.<br />
					Answer overlays instantly.
				</h1>
				<p class="text-xl text-muted-foreground max-w-3xl mx-auto">
					The only platform that combines streamlined mortgage application generation with AI-powered guideline intelligence. Stop switching between tools—everything you need lives in one workspace.
				</p>
				<div class="flex flex-wrap justify-center gap-4">
					<Button size="lg" class="px-8 text-base" onclick={createNewApplication}>
						Start a 1003 Application
					</Button>
					<Button size="lg" variant="outline" class="px-8 text-base" onclick={() => goto('/ai/app')}>
						Open AI Copilot
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
				<span class="font-medium">Trusted by modern lenders and broker networks</span>
				<div class="flex flex-wrap gap-4 text-xs uppercase tracking-wider text-muted-foreground/80">
					<span>Arcadia Lending</span>
					<span>BlueMesa Mortgage</span>
					<span>Summit Ops</span>
					<span>HomeFirst Retail</span>
				</div>
			</div>
		</div>
	</section>

	<!-- Two Products Section -->
	<section class="bg-background py-24">
		<div class="mx-auto max-w-7xl px-6">
			<div class="text-center space-y-4 mb-16">
				<Badge variant="outline" class="bg-secondary text-secondary-foreground">Two powerful tools, one platform</Badge>
				<h2 class="text-4xl font-bold text-foreground">Everything mortgage teams need to move faster</h2>
				<p class="text-lg text-muted-foreground max-w-2xl mx-auto">
					Whether you're collecting borrower data or answering underwriting questions, we've built the tools that save hours every week.
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
				<Badge variant="outline" class="bg-secondary text-secondary-foreground">Why teams choose VistoCloud</Badge>
				<h2 class="text-4xl font-bold text-foreground">Work smarter, not harder</h2>
				<p class="text-lg text-muted-foreground max-w-2xl mx-auto">
					Mortgage professionals spend too much time on manual tasks. We built VistoCloud to give that time back.
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
				<Badge variant="outline" class="bg-secondary text-secondary-foreground">Simple workflow</Badge>
				<h2 class="text-4xl font-bold text-foreground">From borrower intake to submission in three steps</h2>
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
				<h2 class="text-3xl font-semibold text-foreground">Built for overlay-heavy orgs and cross-program scenarios</h2>
				<p class="text-muted-foreground max-w-3xl mx-auto">
					MortgageGuidesAI fuses agency guidelines with your overlays, then calls Vertex AI to deliver contextual answers across every product line.
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
						<span>Compare FHA, VA, USDA, Conventional, and Non-QM eligibility in a single response.</span>
					</li>
					<li class="flex gap-3">
						<span class="mt-1 h-2 w-2 rounded-full bg-primary"></span>
						<span>Quickly toggle overlays on/off to see the delta between investor guidance and your internal policy.</span>
					</li>
					<li class="flex gap-3">
						<span class="mt-1 h-2 w-2 rounded-full bg-primary"></span>
						<span>Share cited answers with processors and compliance directly from the portal.</span>
					</li>
				</ul>
				<div class="flex justify-center gap-4">
					<Button variant="outline" class="px-6" onclick={() => goto('/ai/app')}>
						See AI Copilot in action
					</Button>
					<Button class="px-6" onclick={createNewApplication}>
						Start a 1003 Application
					</Button>
				</div>
			</div>
		</div>
	</section>

	<!-- Testimonials Section -->
	<section class="bg-secondary/40 py-24">
		<div class="mx-auto max-w-6xl space-y-10 px-6">
			<div class="text-center space-y-4">
				<Badge variant="outline" class="bg-secondary text-secondary-foreground">Real results</Badge>
				<h2 class="text-4xl font-bold text-foreground">Teams feel the impact immediately</h2>
				<p class="text-lg text-muted-foreground max-w-2xl mx-auto">
					Mortgage professionals across the country are using VistoCloud to work faster and reduce errors.
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
			<Badge variant="outline" class="bg-primary/10 text-primary">Ready to get started?</Badge>
			<h2 class="text-4xl font-bold text-foreground">Launch in days, not months</h2>
			<p class="text-lg text-muted-foreground max-w-2xl">
				Connect your Firebase project, drop in org overlays, and start generating 1003s and answering overlay questions today. No lengthy onboarding required.
			</p>
			<div class="flex flex-wrap justify-center gap-4">
				<Button size="lg" class="px-8 text-base" onclick={createNewApplication}>
					Start a 1003 Application
				</Button>
				<Button size="lg" variant="outline" class="px-8 text-base" onclick={() => goto('/ai/app')}>
					Try AI Copilot
				</Button>
			</div>
			<p class="text-sm text-muted-foreground mt-4">
				Questions? <a href="mailto:hello@vistocloud.com" class="text-primary hover:underline">Talk to our team</a>
			</p>
		</div>
	</section>
</div>
