<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { Home, MessageCircle, Building2, BookOpen, Layers, BarChart3, Plus, Search, Star } from 'lucide-svelte';
	import { collection, onSnapshot, query, where, orderBy, doc, updateDoc, limit, getDocs } from 'firebase/firestore';
	import { db } from '$lib/firebase';
	import type { Conversation } from '$lib/ai/types';
	const { user, org } = $props<{
		user: { uid: string; name?: string } | null;
		org: { id: string; name?: string } | null;
	}>();

	const links = [
		{ label: 'Chat', href: '/ai/app', icon: MessageCircle },
		{ label: 'Lenders', href: '/ai/app/lenders', icon: Building2 },
		{ label: 'Guidelines', href: '/ai/app/guidelines', icon: BookOpen },
		{ label: 'Overlays', href: '/ai/app/overlays', icon: Layers },
		{ label: 'Analytics', href: '/ai/app/analytics', icon: BarChart3 }
	];

	let conversations = $state<Conversation[]>([]);
	let searchQuery = $state('');
	let favoritesOnly = $state(false);
	let loading = $state(true);
	let unsubConversations = () => {};
	let unsubMessages: Map<string, () => void> = new Map();

	const newChat = () => goto('/ai/app');

	const filteredConversations = $derived(() => {
		let filtered = conversations;
		
		if (favoritesOnly) {
			filtered = filtered.filter(c => c.favorite);
		}
		
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(c => 
				c.title.toLowerCase().includes(query) || 
				(c.excerpt && c.excerpt.toLowerCase().includes(query))
			);
		}
		
		return filtered.sort((a, b) => 
			b.lastMessageAt.getTime() - a.lastMessageAt.getTime()
		);
	});

	const toggleFavorite = async (conversation: Conversation, e: Event) => {
		e.stopPropagation();
		if (!browser || !org || !user) return;
		
		const newFavorite = !conversation.favorite;
		const convoRef = doc(db, 'conversations', conversation.id);
		
		try {
			await updateDoc(convoRef, { favorite: newFavorite });
			// Update local state immediately for better UX
			conversation.favorite = newFavorite;
		} catch (error) {
			console.error('Error toggling favorite:', error);
		}
	};

	const selectConversation = (conversationId: string) => {
		goto(`/ai/app/${conversationId}`);
	};

	const getExcerpt = async (conversationId: string): Promise<string> => {
		if (!browser) return '';
		
		try {
			const messagesQuery = query(
				collection(db, 'messages'),
				where('conversationId', '==', conversationId),
				orderBy('createdAt', 'asc'),
				limit(1)
			);
			const snapshot = await getDocs(messagesQuery);
			
			if (!snapshot.empty) {
				const firstMessage = snapshot.docs[0].data();
				const content = firstMessage.content || '';
				// Return first 100 characters as excerpt
				return content.length > 100 ? content.slice(0, 100) + '...' : content;
			}
		} catch (error) {
			console.error('Error fetching excerpt:', error);
		}
		
		return '';
	};

	onMount(() => {
		if (!browser || !org || !user) {
			loading = false;
			return;
		}

		// Subscribe to conversations
		const conversationsQuery = query(
			collection(db, 'conversations'),
			where('orgId', '==', org.id),
			where('userId', '==', user.uid),
			orderBy('lastMessageAt', 'desc')
		);

		unsubConversations = onSnapshot(conversationsQuery, async (snapshot) => {
			const convos: Conversation[] = [];
			
			for (const docSnap of snapshot.docs) {
				const data = docSnap.data();
				const lastMessageAt = data.lastMessageAt?.toDate ? data.lastMessageAt.toDate() : (data.updatedAt?.toDate ? data.updatedAt.toDate() : (data.createdAt?.toDate ? data.createdAt.toDate() : new Date()));
				const conversation: Conversation = {
					id: docSnap.id,
					orgId: data.orgId,
					userId: data.userId,
					title: data.title || 'Untitled',
					excerpt: data.excerpt || '',
					favorite: data.favorite || false,
					programs: data.programs || [],
					lenderIds: data.lenderIds || [],
					createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
					updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
					lastMessageAt
				};

				// If no excerpt, fetch it from first message
				if (!conversation.excerpt) {
					conversation.excerpt = await getExcerpt(conversation.id);
					// Optionally update the conversation document with the excerpt
					if (conversation.excerpt) {
						const convoRef = doc(db, 'conversations', conversation.id);
						updateDoc(convoRef, { excerpt: conversation.excerpt }).catch(console.error);
					}
				}

				convos.push(conversation);
			}

			conversations = convos;
			loading = false;
		}, (error) => {
			console.error('Error loading conversations:', error);
			loading = false;
		});

		return () => {
			unsubConversations();
			unsubMessages.forEach(unsub => unsub());
			unsubMessages.clear();
		};
	});
</script>

<aside class="w-72 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col">
	<div class="p-4 space-y-1">
		<div class="text-lg font-semibold tracking-wide flex items-center gap-2">
			<Home class="h-4 w-4" /> MORTGAGEGUIDESAI
		</div>
		<p class="text-sm text-muted-foreground">{org?.name || 'Organization'}</p>
		<button
			class="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-3 text-sm font-semibold shadow"
			onclick={newChat}
		>
			<Plus class="h-4 w-4" /> New chat
		</button>
	</div>

	<nav class="px-3 space-y-1">
		{#each links as link}
			<a
				class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary/10 text-sm font-medium"
				href={link.href}
			>
				<svelte:component this={link.icon} class="h-4 w-4" />
				{link.label}
			</a>
		{/each}
	</nav>

	<!-- Conversations Section -->
	<div class="flex-1 overflow-hidden flex flex-col border-t border-sidebar-border mt-2">
		<!-- Search and Filters -->
		<div class="p-3 space-y-2 border-b border-sidebar-border">
			<div class="relative">
				<Search class="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
				<input
					type="text"
					placeholder="Search chats..."
					bind:value={searchQuery}
					class="w-full pl-8 pr-3 py-2 rounded-md border border-sidebar-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
				/>
			</div>
			<button
				onclick={() => favoritesOnly = !favoritesOnly}
				class="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-primary/10 text-sm text-muted-foreground hover:text-sidebar-foreground transition-colors"
			>
				<Star class="h-4 w-4 {favoritesOnly ? 'fill-yellow-400 text-yellow-400' : ''}" />
				<span>Favorites only</span>
			</button>
		</div>

		<!-- Conversations List -->
		<div class="flex-1 overflow-y-auto">
			{#if loading}
				<div class="p-4 text-sm text-muted-foreground">Loading conversations...</div>
			{:else if filteredConversations().length === 0}
				<div class="p-4 text-sm text-muted-foreground text-center">
					{searchQuery || favoritesOnly ? 'No conversations found' : 'No conversations yet'}
				</div>
			{:else}
				<div class="p-2 space-y-1">
					{#each filteredConversations() as conversation (conversation.id)}
						{@const isActive = $page.url.pathname === `/ai/app/${conversation.id}`}
						<div
							class="relative w-full px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors group {isActive ? 'bg-primary/20' : ''}"
						>
							<div
								role="button"
								tabindex="0"
								onclick={(e) => toggleFavorite(conversation, e)}
								onkeydown={(e) => e.key === 'Enter' && toggleFavorite(conversation, e)}
								class="absolute left-3 top-2.5 mt-0.5 shrink-0 {conversation.favorite ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary rounded z-10"
								title={conversation.favorite ? 'Remove from favorites' : 'Add to favorites'}
							>
								<Star class="h-3.5 w-3.5 {conversation.favorite ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}" />
							</div>
							<button
								onclick={() => selectConversation(conversation.id)}
								class="w-full text-left flex items-start gap-2 pl-6"
							>
								<div class="flex-1 min-w-0">
									<div class="font-medium text-sm truncate {isActive ? 'text-primary' : 'text-sidebar-foreground'}">
										{conversation.title}
									</div>
									{#if conversation.excerpt}
										<div class="text-xs text-muted-foreground line-clamp-2 mt-0.5">
											{conversation.excerpt}
										</div>
									{/if}
								</div>
							</button>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>

	<div class="mt-auto p-4 text-xs text-muted-foreground border-t border-sidebar-border">
		<p class="font-medium text-sidebar-foreground">{user?.name || 'User'}</p>
		<p>{org?.name || 'Org'}</p>
	</div>
</aside>

