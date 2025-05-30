declare module 'ENV' {
	export function env(key: string, fallback?: any): string;
}

declare module 'MANIFEST' {
	import { SSRManifest } from '@sveltejs/kit';

	export const manifest: SSRManifest;
	export const prerendered: Set<string>;
}

declare const ENV_PREFIX: string;

declare module 'SERVER' {
	export { Server } from '@sveltejs/kit';
}

declare namespace App {
	export interface Platform {
		/**
		 * The original Node request object (https://nodejs.org/api/http.html#class-httpincomingmessage)
		 */
		req: import('http').IncomingMessage;
	}
}
