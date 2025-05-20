import type { PageServerLoad } from './$types';

export const prerender = true;

export const load: PageServerLoad = async () => {
	return {
		now:
			new Date().getHours() +
			':' +
			new Date().getMinutes() +
			':' +
			new Date().getSeconds(),
	};
};
