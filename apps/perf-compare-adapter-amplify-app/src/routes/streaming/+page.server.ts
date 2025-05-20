import type { ServerLoadEvent } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

const asyncFunction = async (cf: ServerLoadEvent['fetch']) => {
	await new Promise((resolve) => {
		setTimeout(() => {
			resolve(0);
		}, 3000);
	});
	const res = await cf('https://jsonplaceholder.typicode.com/posts');
	return await res.json();
};

export const load: PageServerLoad = ({ fetch }) => {
	const data = asyncFunction(fetch);
	return {
		data,
	};
};
