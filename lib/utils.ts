import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a number as currency with exactly two decimal places
 * @param value - The number to format
 * @returns Formatted string with two decimal places
 */
export function formatCurrency(value: number): string {
  return value.toFixed(2);
}
