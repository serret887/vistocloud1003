import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	server: {
		port: 5173,
		strictPort: false
	},
	build: {
		sourcemap: true
	},
	// Enable source maps for debugging
	css: {
		devSourcemap: true
	},
	ssr: {
		// Fix SSR issue with lucide-svelte and other Svelte components in node_modules
		noExternal: ['@lucide/svelte']
	},
	optimizeDeps: {
		// Ensure lucide-svelte is pre-bundled
		include: ['@lucide/svelte']
	}
});
