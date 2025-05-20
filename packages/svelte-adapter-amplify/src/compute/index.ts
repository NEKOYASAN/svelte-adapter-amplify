import 'POLYFILL';
import { env } from 'ENV';
import { manifest } from 'MANIFEST';
import { Server } from 'SERVER';
import { type HttpBindings, serve } from '@hono/node-server';
import { RESPONSE_ALREADY_SENT } from '@hono/node-server/utils/response';
import { getRequest, setResponse } from '@sveltejs/kit/node';
import { Hono } from 'hono/tiny';

export const host = env('HOST', '0.0.0.0');
export const port = env('PORT', '3000');

const handler = new Server(manifest);
const origin = env('ORIGIN', undefined);
const xff_depth = Number.parseInt(env('XFF_DEPTH', '1'));
const address_header = env('ADDRESS_HEADER', '').toLowerCase();
const protocol_header = env('PROTOCOL_HEADER', '').toLowerCase();
const host_header = env('HOST_HEADER', 'host').toLowerCase();
const body_size_limit = Number.parseInt(env('BODY_SIZE_LIMIT', '524288'));

export const hono = new Hono<{ Bindings: HttpBindings }>().use(
	'*',
	async (_, next) => {
		// @ts-expect-error env is valid
		await handler.init({ env: process.env });
		await next();
	},
);

hono.get('*', async (c) => {
	const protocol =
		(protocol_header && c.req.header(protocol_header)) || 'https';
	const host = c.req.header(host_header);
	let request: Request;

	try {
		request = await getRequest({
			base: origin || `${protocol}://${host}`,
			request: c.env.incoming,
			bodySizeLimit: body_size_limit,
		});
	} catch (e) {
		return c.text('Invalid request body', {
			status: 400,
		});
	}

	await setResponse(
		c.env.outgoing,
		await handler.respond(request, {
			platform: { req: c.env.incoming },
			getClientAddress: () => {
				if (address_header) {
					if (!c.req.header(address_header)) {
						throw new Error(
							`Address header was specified with ${ENV_PREFIX}ADDRESS_HEADER=${address_header} but is absent from request`,
						);
					}

					const value = c.req.header(address_header) || '';

					if (address_header === 'x-forwarded-for') {
						const addresses = value.split(',');

						if (xff_depth < 1) {
							throw new Error(
								`${ENV_PREFIX}XFF_DEPTH must be a positive integer`,
							);
						}

						if (xff_depth > addresses.length) {
							throw new Error(
								`${ENV_PREFIX}XFF_DEPTH is ${xff_depth}, but only found ${
									addresses.length
								} addresses`,
							);
						}
						return addresses[addresses.length - xff_depth].trim();
					}

					return value;
				}

				return (
					c.env.incoming.connection?.remoteAddress ||
					// @ts-expect-error
					c.env.incoming.connection?.socket?.remoteAddress ||
					c.env.incoming.socket?.remoteAddress ||
					// @ts-expect-error
					c.env.incoming.info?.remoteAddress
				);
			},
		}),
	);
	return RESPONSE_ALREADY_SENT;
});

export const server = serve({
	fetch: hono.fetch,
	port: Number(port),
	hostname: host,
});
