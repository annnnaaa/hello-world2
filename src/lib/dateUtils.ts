import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  format,
} from 'date-fns';

/**
 * Return all 7 days of the week containing the given date.
 * Week starts on Monday.
 */
export function getWeekDays(date: Date): Date[] {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = endOfWeek(date, { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
}

/**
 * Return all days in the calendar month containing the given date.
 */
export function getMonthDays(date: Date): Date[] {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  return eachDayOfInterval({ start, end });
}

/**
 * Check whether a date falls within a start–end range (inclusive).
 */
export function isDateInRange(date: Date, start: Date, end: Date): boolean {
  return isWithinInterval(date, { start, end });
}

/**
 * Format a time range as "HH:mm – HH:mm" for display.
 *
 * @param start - Start date/time.
 * @param end - End date/time.
 * @param timeFormat - date-fns format token for time (default 'HH:mm').
 */
export function formatTimeRange(
  start: Date | string,
  end: Date | string,
  timeFormat: string = 'HH:mm',
): string {
  const s = typeof start === 'string' ? new Date(start) : start;
  const e = typeof end === 'string' ? new Date(end) : end;
  return `${format(s, timeFormat)} – ${format(e, timeFormat)}`;
}
