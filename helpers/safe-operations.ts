/**
 * Safely performs a reduce operation on an array, handling undefined and null values
 * @param array The array to reduce
 * @param callback The reduce callback function
 * @param initialValue The initial value for the reduce operation
 * @returns The result of the reduce or the initial value if the array is invalid
 */
export function safeReduce<T, U>(array: T[] | undefined | null, callback: (accumulator: U, currentValue: T, currentIndex: number, array: T[]) => U, initialValue: U): U {
	if (!array || !Array.isArray(array)) {
		return initialValue;
	}

	return array.reduce(callback, initialValue);
}

/**
 * Safely performs a map operation on an array, handling undefined and null values
 * @param array The array to map
 * @param callback The map callback function
 * @returns The new array from mapping or an empty array if the input is invalid
 */
export function safeMap<T, U>(array: T[] | undefined | null, callback: (value: T, index: number, array: T[]) => U): U[] {
	if (!array || !Array.isArray(array)) {
		return [];
	}

	return array.map(callback);
}

/**
 * Safely performs a filter operation on an array, handling undefined and null values
 * @param array The array to filter
 * @param callback The filter predicate function
 * @returns The filtered array or an empty array if the input is invalid
 */
export function safeFilter<T>(array: T[] | undefined | null, callback: (value: T, index: number, array: T[]) => boolean): T[] {
	if (!array || !Array.isArray(array)) {
		return [];
	}

	return array.filter(callback);
}
