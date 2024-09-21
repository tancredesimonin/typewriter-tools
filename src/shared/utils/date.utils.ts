/**
 * Formats a date string to the format YYYY-MM-DD.
 * If the date is invalid, it returns the current date.
 * @param date - The date string to format.
 * @returns The formatted date string.
 */
export function formatDate(date: string): string {
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return new Date().toISOString().split("T")[0]!;
  }
  return dateObj.toISOString().split("T")[0]!;
}
