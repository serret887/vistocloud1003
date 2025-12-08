<script lang="ts">
	import { goto } from '$app/navigation';
	import { applicationStore } from '$lib/stores/application/index';
	import { Button } from '$lib/components/ui';
	import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '$lib/components/ui';
	import { Plus, FileText, TrendingUp, Users } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { _ } from 'svelte-i18n';
	import LanguageSelector from '$lib/components/LanguageSelector.svelte';
	
	async function createNewApplication() {
		try {
			// Create a new application in Firestore (Firestore will auto-generate the ID)
			const appId = await applicationStore.createApplication();
			toast.success($_('toast.applicationCreated'), {
				description: $_('toast.applicationCreatedDescription')
			});
			goto(`/application/${appId}/client-info`);
		} catch (error) {
			toast.error($_('toast.applicationCreateFailed'), {
				description: error instanceof Error ? error.message : $_('toast.applicationCreateFailedDescription')
			});
		}
	}
</script>

<div class="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
	<!-- Language Selector -->
	<div class="container mx-auto px-4 py-4 flex justify-end">
		<LanguageSelector />
	</div>
	
	<!-- Hero Section -->
	<div class="container mx-auto px-4 py-16">
		<div class="max-w-4xl mx-auto text-center space-y-8">
			<div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
				<TrendingUp class="h-4 w-4" />
				<span>{$_('app.tagline')}</span>
			</div>
			
			<h1 class="text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent">
				{$_('app.name')}
			</h1>
			
			<p class="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
				{$_('app.subtitle')}
			</p>
			
			<div class="flex flex-col sm:flex-row gap-4 justify-center pt-4">
				<Button onclick={createNewApplication} size="lg" class="gap-2">
					<Plus class="h-5 w-5" />
					{$_('home.newApplication')}
				</Button>
				<Button variant="outline" size="lg" class="gap-2" onclick={() => goto('/applications')}>
					<FileText class="h-5 w-5" />
					{$_('home.viewApplications')}
				</Button>
			</div>
		</div>
	</div>
	
	<!-- Features Section -->
	<div class="container mx-auto px-4 py-16">
		<div class="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
			<Card class="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
				<CardHeader>
					<div class="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
						<FileText class="h-6 w-6 text-primary" />
					</div>
					<CardTitle>{$_('home.features.smartForms.title')}</CardTitle>
					<CardDescription>
						{$_('home.features.smartForms.description')}
					</CardDescription>
				</CardHeader>
			</Card>
			
			<Card class="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
				<CardHeader>
					<div class="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
						<Users class="h-6 w-6 text-primary" />
					</div>
					<CardTitle>{$_('home.features.multiClient.title')}</CardTitle>
					<CardDescription>
						{$_('home.features.multiClient.description')}
					</CardDescription>
				</CardHeader>
			</Card>
			
			<Card class="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
				<CardHeader>
					<div class="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
						<TrendingUp class="h-6 w-6 text-primary" />
					</div>
					<CardTitle>{$_('home.features.realtime.title')}</CardTitle>
					<CardDescription>
						{$_('home.features.realtime.description')}
					</CardDescription>
				</CardHeader>
			</Card>
		</div>
	</div>
</div>
