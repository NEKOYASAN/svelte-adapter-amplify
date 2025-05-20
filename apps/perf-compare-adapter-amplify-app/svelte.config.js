import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import adapter from 'amplify-adapter';

const config = {
	preprocess: vitePreprocess(),
	kit: { adapter: adapter() },
};

export default config;
