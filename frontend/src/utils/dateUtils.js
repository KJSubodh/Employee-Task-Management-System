import { format } from 'date-fns';

/**
 * Formats a date-only value (e.g. task.startDate / task.dueDate) WITHOUT
 * letting the browser's local timezone shift the calendar day.
 *
 * Why this exists:
 * Dates coming from a <input type="date"> (or stored as YYYY-MM-DD) are
 * parsed by `new Date(...)` as UTC midnight. date-fns' `format()` then
 * renders that Date object in the *local* timezone. If the viewer is in
 * a timezone behind UTC, midnight UTC rolls back to the previous day
 * locally - so the same stored value can display as "Jul 5" in one
 * timezone and "Jul 4" in another, even though nothing in the database
 * changed.
 *
 * This helper rebuilds the date using its UTC year/month/day components
 * as a *local* date, so `format()` can't reinterpret it across the
 * midnight boundary.
 */
export const formatUTCDate = (dateStr, fmt = 'MMM dd, yyyy') => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const utcSafe = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  return format(utcSafe, fmt);
};