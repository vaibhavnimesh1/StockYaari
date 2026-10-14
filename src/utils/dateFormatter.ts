import { Period } from '../types/stock';

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/**
 * Safely parses any date string (ISO, "YYYY-MM-DD", "YYYY-MM-DD HH:mm:ss") into a Date object
 */
export const parseDateString = (dateStr: string): Date => {
  // Replace space with 'T' for ISO compatibility if needed
  const normalized = dateStr.includes(' ') && !dateStr.includes('T')
    ? dateStr.replace(' ', 'T')
    : dateStr;
  const d = new Date(normalized);
  if (isNaN(d.getTime())) {
    // Fallback manual regex for YYYY-MM-DD
    const parts = dateStr.split(/[- :]/);
    if (parts.length >= 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const hours = parts.length > 3 ? parseInt(parts[3], 10) : 0;
      const minutes = parts.length > 4 ? parseInt(parts[4], 10) : 0;
      return new Date(year, month, day, hours, minutes);
    }
  }
  return d;
};

/**
 * Formats a date string into standard table format: "24 Sep 2026"
 */
export const formatTableDate = (dateStr: string): string => {
  if (!dateStr) return '—';
  const d = parseDateString(dateStr);
  if (isNaN(d.getTime())) return dateStr;

  const day = d.getDate().toString().padStart(2, '0');
  const month = MONTH_NAMES[d.getMonth()];
  const year = d.getFullYear();

  return `${day} ${month} ${year}`;
};

/**
 * Formats date label for chart X-axis depending on the selected Period:
 * - 1D: "10:30" (or 10:30 AM)
 * - 1W, 1M, 3M: "24 Sep"
 * - 6M, 1Y: "Sep 26" (month + 2-digit year)
 */
export const formatChartAxisDate = (dateStr: string, period: Period): string => {
  if (!dateStr) return '';
  const d = parseDateString(dateStr);
  if (isNaN(d.getTime())) return dateStr;

  const day = d.getDate().toString().padStart(2, '0');
  const month = MONTH_NAMES[d.getMonth()];
  const shortYear = d.getFullYear().toString().slice(-2);

  if (period === '1D') {
    const hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  }

  if (period === '1W' || period === '1M' || period === '3M') {
    return `${day} ${month}`;
  }

  // 6M or 1Y
  return `${month} '${shortYear}`;
};

/**
 * Formats days ago relative string (e.g., "12 Days Ago", "363 Days Ago")
 */
export const formatDaysAgo = (dateStr: string): string => {
  if (!dateStr) return '';
  const d = parseDateString(dateStr);
  if (isNaN(d.getTime())) return '';

  const now = new Date();
  const diffTime = Math.abs(now.getTime() - d.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} Days Ago`;
};
