import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
	const res = await fetch('https://jsonplaceholder.typicode.com/posts');
	const data = await res.json();
	return {
		data,
	};
};
