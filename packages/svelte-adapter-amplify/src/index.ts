import * as fs from 'node:fs';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { Adapter } from '@sveltejs/kit';

export type SvelteAdapterAmplifyConfig = {
	/**
	 * The directory to output the built files.
	 * @default 'dist'
	 */
	outDir?: string;
	/**
	 * The prefix to use for environment variables.
	 * @default ''
	 */
	envPrefix?: string;
};

const computeFilesPath = fileURLToPath(
	new URL('./compute', import.meta.url).href,
);

export default function svelteAdapterAmplify(
	config: SvelteAdapterAmplifyConfig,
): Adapter {
	const { outDir = 'dist', envPrefix = '' } = config ?? {};
	const adapterName = 'svelte-adapter-amplify';
	return {
		name: adapterName,
		async adapt(builder) {
			const tempDir = builder.getBuildDirectory(adapterName);
			const serverDir = `${outDir}/compute/default`;
			const clientDir = `${outDir}/static/${builder.config.kit.paths.base}`;
			//	const prerenderedDir = `${outDir}/prerendered/${builder.config.kit.paths.base}`;

			builder.rimraf(outDir);
			builder.rimraf(tempDir);
			builder.mkdirp(tempDir);

			builder.writeClient(clientDir);
			// builder.writePrerendered(prerenderedDir)
			builder.writePrerendered(clientDir);

			builder.writeServer(`${serverDir}/server`);

			writeFileSync(
				`${tempDir}/manifest.js`,
				`export const manifest = ${builder.generateManifest({ relativePath: './' })};\n
				export const prerendered = new Set(${JSON.stringify(builder.prerendered.paths)});`,
			);
			const files = fs.readdirSync(computeFilesPath);
			for (const file of files) {
				if (file.endsWith('.js')) {
					builder.copy(`${computeFilesPath}/${file}`, `${serverDir}/${file}`, {
						replace: {
							POLYFILL: './polyfill.js',
							ENV: './env.js',
							MANIFEST: './server/manifest.js',
							SERVER: './server/index.js',
							ENV_PREFIX: JSON.stringify(envPrefix),
						},
					});
				}
			}
			writeFileSync(
				`${outDir}/deploy-manifest.json`,
				JSON.stringify({
					version: 1,
					framework: { name: 'SvelteKit', version: '2.11.1' },
					routes: [
						{
							path: '/*.*',
							target: {
								kind: 'Static',
								cacheControl: 'public, max-age=3600',
							},
							fallback: {
								kind: 'Compute',
								src: 'default',
							},
						},
						{
							path: '/*',
							target: {
								kind: 'Compute',
								src: 'default',
							},
						},
					],
					computeResources: [
						{
							name: 'default',
							runtime: 'nodejs22.x',
							entrypoint: 'index.js',
						},
					],
				}),
			);
		},
	};
}
