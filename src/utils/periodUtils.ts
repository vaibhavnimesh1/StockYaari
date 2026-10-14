import { Candle, Period } from '../types/stock';
import { parseDateString } from './dateFormatter';

/**
 * Filter daily candles for a requested period without refetching from API.
 * Slices relative to the latest available candle to gracefully handle weekends and holidays.
 */
export const filterCandlesByPeriod = (
  candles: Candle[],
  period: Period,
  intradayCandles: Candle[] = []
): Candle[] => {
  if (period === '1D') {
    return intradayCandles.length > 0 ? intradayCandles : candles.slice(0, 2);
  }

  if (!candles || candles.length === 0) {
    return [];
  }

  if (period === '1Y') {
    return candles;
  }

  // Find the latest date among the candles (candles are assumed sorted newest-to-oldest or chronological)
  const sortedByTime = [...candles].sort(
    (a, b) => parseDateString(b.rawDate).getTime() - parseDateString(a.rawDate).getTime()
  );

  const latestDate = parseDateString(sortedByTime[0].rawDate);
  if (isNaN(latestDate.getTime())) {
    // Fallback to candle counts if dates can't be parsed
    const countMap: Record<Period, number> = {
      '1D': 1,
      '1W': 5,
      '1M': 22,
      '3M': 65,
      '6M': 130,
      '1Y': candles.length,
    };
    return candles.slice(0, countMap[period] || candles.length);
  }

  const daysToSubtract: Record<Exclude<Period, '1D'>, number> = {
    '1W': 7,
    '1M': 31,
    '3M': 92,
    '6M': 183,
    '1Y': 366,
  };

  const cutoffTime = latestDate.getTime() - daysToSubtract[period] * 24 * 60 * 60 * 1000;

  const filtered = candles.filter((c) => {
    const time = parseDateString(c.rawDate).getTime();
    return time >= cutoffTime;
  });

  // Ensure at least 2 points are returned if data is available
  if (filtered.length < 2 && candles.length >= 2) {
    return candles.slice(0, Math.min(candles.length, 5));
  }

  return filtered;
};

/**
 * Returns human-readable label for a Period
 */
export const getPeriodLabel = (period: Period): string => {
  switch (period) {
    case '1D':
      return '1 Day';
    case '1W':
      return '1 Week';
    case '1M':
      return '1 Month';
    case '3M':
      return '3 Months';
    case '6M':
      return '6 Months';
    case '1Y':
      return '1 Year';
    default:
      return period;
  }
};
