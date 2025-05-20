import { defineConfig } from 'tsup';

export default defineConfig({
	entry: ['src/index.ts', 'src/compute/*.ts'],
	sourcemap: true,
	dts: true,
	format: ['esm', 'cjs'],
	external: ['POLYFILL', 'ENV', 'MANIFEST', 'SERVER', 'ENV_PREFIX'],
	noExternal: [/(@hono\/.*)/, /(hono\/.*)/, /(@sveltejs\/*)/],
	shims: true,
	treeshake: true,
	silent: false,
	splitting: false,
	clean: true,
});
