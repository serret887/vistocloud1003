<script lang="ts">
	import { goto } from '$app/navigation';
	import { applicationStore } from '$lib/stores/application';
	import { Button } from '$lib/components/ui';
	import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '$lib/components/ui';
	import { Plus, FileText, TrendingUp, Users } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	
	async function createNewApplication() {
		try {
			// Create a new application in Firestore (Firestore will auto-generate the ID)
			const appId = await applicationStore.createApplication();
			toast.success('Application created successfully', {
				description: 'You can now start filling out the application form.'
			});
			goto(`/application/${appId}/client-info`);
		} catch (error) {
			toast.error('Failed to create application', {
				description: error instanceof Error ? error.message : 'Please try again.'
			});
		}
	}
</script>

<div class="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
	<!-- Hero Section -->
	<div class="container mx-auto px-4 py-16">
		<div class="max-w-4xl mx-auto text-center space-y-8">
			<div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
				<TrendingUp class="h-4 w-4" />
				<span>Streamlined Mortgage Processing</span>
			</div>
			
			<h1 class="text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent">
				VistoCloud
			</h1>
			
			<p class="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
				Modern mortgage application processing platform. Collect, validate, and process 
				applications with AI-powered assistance and real-time collaboration.
			</p>
			
			<div class="flex flex-col sm:flex-row gap-4 justify-center pt-4">
				<Button onclick={createNewApplication} size="lg" class="gap-2">
					<Plus class="h-5 w-5" />
					New Application
				</Button>
				<Button variant="outline" size="lg" class="gap-2" onclick={() => goto('/applications')}>
					<FileText class="h-5 w-5" />
					View Applications
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
					<CardTitle>Smart Forms</CardTitle>
					<CardDescription>
						Intelligent form validation and auto-completion powered by AI
					</CardDescription>
				</CardHeader>
			</Card>
			
			<Card class="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
				<CardHeader>
					<div class="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
						<Users class="h-6 w-6 text-primary" />
					</div>
					<CardTitle>Multi-Client Support</CardTitle>
					<CardDescription>
						Handle primary borrowers and co-borrowers seamlessly
					</CardDescription>
				</CardHeader>
			</Card>
			
			<Card class="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
				<CardHeader>
					<div class="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
						<TrendingUp class="h-6 w-6 text-primary" />
					</div>
					<CardTitle>Real-time Sync</CardTitle>
					<CardDescription>
						Automatic saving with Firebase backend for data persistence
					</CardDescription>
				</CardHeader>
			</Card>
		</div>
	</div>
</div>
