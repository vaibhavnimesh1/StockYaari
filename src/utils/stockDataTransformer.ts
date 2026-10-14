import {
  Candle,
  QuoteApiResponse,
  RawCandle,
  StockQuote,
  StockStatistics,
} from '../types/stock';
import { formatTableDate, parseDateString } from './dateFormatter';

/**
 * Transforms raw API time series values into validated Candle objects
 * Pipeline: Parse -> Validate (drop NaNs / invalid rows) -> Convert to numbers -> Sort
 */
export const transformRawCandles = (
  rawValues?: RawCandle[],
  isIntraday = false
): Candle[] => {
  if (!Array.isArray(rawValues) || rawValues.length === 0) {
    return [];
  }

  const validCandles: Candle[] = [];

  for (const item of rawValues) {
    if (!item || !item.datetime) continue;

    const open = parseFloat(item.open);
    const high = parseFloat(item.high);
    const low = parseFloat(item.low);
    const close = parseFloat(item.close);
    const volume = parseInt(item.volume, 10);

    // Validation: drop NaN or incomplete price data
    if (isNaN(open) || isNaN(high) || isNaN(low) || isNaN(close)) {
      continue;
    }

    // High must be >= Low
    const safeHigh = Math.max(high, open, close);
    const safeLow = Math.min(low, open, close);
    const safeVolume = isNaN(volume) ? 0 : Math.max(0, volume);

    validCandles.push({
      date: isIntraday
        ? formatIntradayTime(item.datetime)
        : formatTableDate(item.datetime),
      rawDate: item.datetime,
      open,
      high: safeHigh,
      low: safeLow,
      close,
      volume: safeVolume,
    });
  }

  // Twelve Data returns newest first. Sort newest first for table, but we keep rawDate intact
  validCandles.sort(
    (a, b) => parseDateString(b.rawDate).getTime() - parseDateString(a.rawDate).getTime()
  );

  return validCandles;
};

/**
 * Formats intraday time representation ("10:30 AM")
 */
const formatIntradayTime = (datetimeStr: string): string => {
  const d = parseDateString(datetimeStr);
  if (isNaN(d.getTime())) return datetimeStr;

  return d.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Transforms QuoteApiResponse to normalized StockQuote
 */
export const transformQuoteResponse = (
  quote: QuoteApiResponse,
  dailyCandles: Candle[] = []
): StockQuote => {
  const price = parseFloat(quote.close);
  const previousClose = parseFloat(quote.previous_close);
  const open = parseFloat(quote.open);
  const high = parseFloat(quote.high);
  const low = parseFloat(quote.low);
  const volume = parseInt(quote.volume, 10);
  const change = parseFloat(quote.change);
  const percentChange = parseFloat(quote.percent_change);

  // Derive 52W High and Low with fallback to daily candles if needed
  let fiftyTwoHigh = quote.fifty_two_week?.high ? parseFloat(quote.fifty_two_week.high) : NaN;
  let fiftyTwoLow = quote.fifty_two_week?.low ? parseFloat(quote.fifty_two_week.low) : NaN;

  if (isNaN(fiftyTwoHigh) || isNaN(fiftyTwoLow) || fiftyTwoHigh <= 0) {
    if (dailyCandles.length > 0) {
      fiftyTwoHigh = Math.max(...dailyCandles.map((c) => c.high));
      fiftyTwoLow = Math.min(...dailyCandles.map((c) => c.low));
    } else {
      fiftyTwoHigh = !isNaN(high) ? high : price;
      fiftyTwoLow = !isNaN(low) ? low : price;
    }
  }

  return {
    symbol: quote.symbol || 'UNKNOWN',
    name: quote.name || quote.symbol || 'Stock',
    exchange: quote.exchange || 'NSE',
    currency: quote.currency || 'INR',
    price: !isNaN(price) ? price : (dailyCandles[0]?.close ?? 0),
    change: !isNaN(change) ? change : 0,
    percentChange: !isNaN(percentChange) ? percentChange : 0,
    previousClose: !isNaN(previousClose) ? previousClose : (dailyCandles[1]?.close ?? 0),
    open: !isNaN(open) ? open : (dailyCandles[0]?.open ?? 0),
    high: !isNaN(high) ? high : (dailyCandles[0]?.high ?? 0),
    low: !isNaN(low) ? low : (dailyCandles[0]?.low ?? 0),
    volume: !isNaN(volume) ? volume : (dailyCandles[0]?.volume ?? 0),
    fiftyTwoWeek: {
      high: fiftyTwoHigh,
      low: fiftyTwoLow,
      range: quote.fifty_two_week?.range,
    },
    isMarketOpen: quote.is_market_open,
    datetime: quote.datetime,
  };
};

/**
 * Derives comprehensive statistics from quote and candle history
 */
export const deriveStockStatistics = (
  quote: StockQuote | null,
  candles: Candle[]
): StockStatistics => {
  const latestCandle = candles[0];

  const open = quote?.open ?? latestCandle?.open ?? 0;
  const high = quote?.high ?? latestCandle?.high ?? 0;
  const low = quote?.low ?? latestCandle?.low ?? 0;
  const previousClose = quote?.previousClose ?? candles[1]?.close ?? latestCandle?.close ?? 0;
  const volume = quote?.volume ?? latestCandle?.volume ?? 0;

  let fiftyTwoWeekHigh = quote?.fiftyTwoWeek?.high ?? 0;
  let fiftyTwoWeekLow = quote?.fiftyTwoWeek?.low ?? 0;

  if (fiftyTwoWeekHigh === 0 && candles.length > 0) {
    fiftyTwoWeekHigh = Math.max(...candles.map((c) => c.high));
    fiftyTwoWeekLow = Math.min(...candles.map((c) => c.low));
  }

  return {
    open,
    high,
    low,
    previousClose,
    volume,
    fiftyTwoWeekHigh,
    fiftyTwoWeekLow,
    currency: quote?.currency || 'INR',
  };
};
