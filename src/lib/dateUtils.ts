/**
 * Centralized date/time utility for consistent date handling across the application.
 * All date operations should use these utilities to ensure timezone consistency.
 */

// Application timezone - configure based on your requirements
// Using UTC as the default for consistency, can be changed to a specific timezone
const APP_TIMEZONE = 'UTC';

/**
 * Get the current date in ISO format (YYYY-MM-DD) based on application timezone
 */
export function getCurrentDate(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get date N days ago in ISO format (YYYY-MM-DD)
 */
export function getDateDaysAgo(days: number): string {
  const now = new Date();
  now.setUTCDate(now.getUTCDate() - days);
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format ISO date string to display format (e.g., "Mon, 31 Aug 2026")
 */
export function formatDisplayDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format ISO date string to short format (e.g., "31 Aug 2026")
 */
export function formatShortDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Convert ISO date string to Date object at start of day (00:00:00 UTC)
 */
export function dateToStartOfDay(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
}

/**
 * Convert ISO date string to Date object at end of day (23:59:59.999 UTC)
 */
export function dateToEndOfDay(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
}

/**
 * Check if a date is in the future
 */
export function isFutureDate(iso: string): boolean {
  const today = getCurrentDate();
  return iso > today;
}

/**
 * Check if a date is today
 */
export function isToday(iso: string): boolean {
  return iso === getCurrentDate();
}

/**
 * Get the next day's date
 */
export function getNextDay(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + 1);
  const nextYear = date.getUTCFullYear();
  const nextMonth = String(date.getUTCMonth() + 1).padStart(2, '0');
  const nextDay = String(date.getUTCDate()).padStart(2, '0');
  return `${nextYear}-${nextMonth}-${nextDay}`;
}

/**
 * Get the previous day's date
 */
export function getPreviousDay(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() - 1);
  const prevYear = date.getUTCFullYear();
  const prevMonth = String(date.getUTCMonth() + 1).padStart(2, '0');
  const prevDay = String(date.getUTCDate()).padStart(2, '0');
  return `${prevYear}-${prevMonth}-${prevDay}`;
}

/**
 * Validate ISO date format (YYYY-MM-DD)
 */
export function isValidISODate(iso: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(iso);
}

/**
 * Get a range of dates between start and end (inclusive)
 */
export function getDateRange(startIso: string, endIso: string): string[] {
  const dates: string[] = [];
  let current = startIso;
  while (current <= endIso) {
    dates.push(current);
    current = getNextDay(current);
  }
  return dates;
}
