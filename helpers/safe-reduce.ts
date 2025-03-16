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
