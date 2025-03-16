import { unstable_cache } from "next/cache";

type CacheOptions = {
	revalidate?: number | false;
	tags?: string[];
};

/**
 * Creates a cached version of a function using Next.js unstable_cache
 */
export function createCache<Args extends unknown[], Result>(fn: (...args: Args) => Promise<Result>, keyParts: string[], options: CacheOptions = {}): (...args: Args) => Promise<Result> {
	const { revalidate = 3600, tags = [] } = options;

	return unstable_cache(fn, [...keyParts], {
		revalidate,
		tags: ["global", ...tags],
	});
}

/**
 * Cached version of fetch for data fetching
 */
export async function cachedFetch<T>(url: string, options?: RequestInit, cacheOptions: CacheOptions = {}): Promise<T> {
	const fetchFn = async () => {
		const response = await fetch(url, {
			...options,
			next: { revalidate: cacheOptions.revalidate },
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch: ${response.status}`);
		}

		return response.json() as Promise<T>;
	};

	const cachedFn = createCache<[], T>(fetchFn, ["fetch", url, JSON.stringify(options)], cacheOptions);

	return cachedFn();
}
