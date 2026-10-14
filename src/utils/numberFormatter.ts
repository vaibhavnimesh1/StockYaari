/**
 * Currency & Number Formatting Utilities
 * Adheres to Indian grouping (en-IN) for INR and en-US for other currencies.
 */

export interface FormatCurrencyOptions {
  currency?: string;
  decimals?: number;
  showSign?: boolean;
}

/**
 * Returns the proper symbol for a currency code
 */
export const getCurrencySymbol = (currencyCode?: string): string => {
  if (!currencyCode) return '$';
  const upper = currencyCode.toUpperCase();
  switch (upper) {
    case 'INR':
      return '₹';
    case 'USD':
      return '$';
    case 'EUR':
      return '€';
    case 'GBP':
      return '£';
    case 'JPY':
      return '¥';
    default:
      return `${upper} `;
  }
};

/**
 * Formats a number with proper international / Indian comma separators
 */
export const formatCurrency = (
  value: number | string | undefined | null,
  options: FormatCurrencyOptions = {}
): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (num === undefined || num === null || isNaN(num)) {
    return '—';
  }

  const { currency = 'USD', decimals = 2, showSign = false } = options;
  const isINR = currency.toUpperCase() === 'INR';
  const symbol = getCurrencySymbol(currency);
  const locale = isINR ? 'en-IN' : 'en-US';

  const sign = showSign && num > 0 ? '+' : '';
  const formattedNum = Math.abs(num).toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  const negativeSign = num < 0 ? '-' : '';

  return `${sign}${negativeSign}${symbol}${formattedNum}`;
};

/**
 * Formats compact volume (e.g., 2.4M, 1.8K, 3.1B)
 */
export const formatCompactVolume = (volume: number | string | undefined | null): string => {
  const num = typeof volume === 'string' ? parseFloat(volume) : volume;
  if (num === undefined || num === null || isNaN(num)) {
    return '—';
  }

  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(1)}B`;
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`;
  }
  return num.toLocaleString();
};

/**
 * Formats percentage with sign (e.g., +1.50%, -0.45%)
 */
export const formatPercent = (
  value: number | string | undefined | null,
  decimals = 2
): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (num === undefined || num === null || isNaN(num)) {
    return '0.00%';
  }

  const sign = num > 0 ? '+' : '';
  return `${sign}${num.toFixed(decimals)}%`;
};

/**
 * Formats full numeric values with Indian or standard grouping (e.g. 27,27,485)
 */
export const formatNumber = (
  value: number | string | undefined | null,
  currency = 'INR'
): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (num === undefined || num === null || isNaN(num)) return '—';
  const isINR = currency.toUpperCase() === 'INR';
  return num.toLocaleString(isINR ? 'en-IN' : 'en-US');
};
