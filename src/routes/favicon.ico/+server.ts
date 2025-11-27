import { readFileSync } from 'fs';
import { join } from 'path';
import { dev } from '$app/environment';

export async function GET() {
	try {
		// Serve the SVG favicon when browsers request favicon.ico
		// In SvelteKit, static files are in the static directory
		const faviconPath = dev 
			? join(process.cwd(), 'static', 'favicon.svg')
			: join(process.cwd(), 'build', 'client', 'favicon.svg');
		
		const favicon = readFileSync(faviconPath, 'utf-8');
		
		return new Response(favicon, {
			headers: {
				'Content-Type': 'image/svg+xml',
				'Cache-Control': 'public, max-age=31536000'
			}
		});
	} catch (error) {
		// Fallback: return a simple SVG if file not found
		return new Response(
			'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#0066CC"/></svg>',
			{
				headers: {
					'Content-Type': 'image/svg+xml'
				}
			}
		);
	}
}

