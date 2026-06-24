import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';

/**
 * Merge Tailwind CSS classes with conflict resolution.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format a date using date-fns format tokens.
 *
 * @param date - Date instance or ISO string to format.
 * @param fmt - date-fns format string (e.g. 'PPP', 'yyyy-MM-dd').
 */
export function formatDate(date: Date | string | number, fmt: string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, fmt);
}
