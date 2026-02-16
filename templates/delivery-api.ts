/**
 * Builds a Delivery API URL from a host and endpoint path.
 *
 * The `host` can be either:
 * - origin only (`https://example.com`), or
 * - origin + delivery root (`https://example.com/umbraco/delivery`).
 *
 * In both cases the returned URL is normalized to the Delivery API root.
 */
export function buildDeliveryApiUrl(host: string, endpoint: string): URL {
	const base = new URL(host);
	const normalizedPath = base.pathname.replace(/\/$/, '');
	const deliveryRoot = normalizedPath.endsWith('/umbraco/delivery')
		? normalizedPath
		: '/umbraco/delivery';

	return new URL(`${deliveryRoot}${endpoint}`, `${base.origin}/`);
}
