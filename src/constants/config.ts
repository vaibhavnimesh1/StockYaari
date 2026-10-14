import { Period } from '../types/stock';

/**
 * Global Configuration for Twelve Data API and Application
 */
export const CONFIG = {
  // Base endpoint for Twelve Data REST API
  API_BASE_URL: 'https://api.twelvedata.com',

  // API key loaded from environment variable (with user provided key fallback)
  API_KEY:
    process.env.TWELVE_DATA_KEY ||
    process.env.EXPO_PUBLIC_TWELVE_DATA_KEY ||
    '2dcc4fae34a0432c86c910b4f0650e5b',

  // Default initial stock symbol loaded on app launch.
  // Note: 'AAPL' is recommended for free-tier reliability.
  // Indian stocks like 'RELIANCE:NSE' require Twelve Data Indian market exchange subscriptions.
  DEFAULT_SYMBOL: 'AAPL',

  // Supported time periods for the dashboard selector
  PERIODS: ['1D', '1W', '1M', '3M', '6M', '1Y'] as const satisfies readonly Period[],

  // Default active period on initial load
  DEFAULT_PERIOD: '1M' as Period,

  // Intervals and data limits for Twelve Data requests
  DAILY_INTERVAL: '1day',
  DAILY_OUTPUT_SIZE: 365, // Fetch 1 full year once to minimize rate limits

  INTRADAY_INTERVAL: '5min',
  INTRADAY_OUTPUT_SIZE: 80, // Approximately 1 trading day of 5-minute candles

  // In-memory cache time-to-live (60 seconds)
  CACHE_TTL_MS: 60 * 1000,

  // Debounce duration for symbol search input (500ms)
  SEARCH_DEBOUNCE_MS: 500,

  // Fetch timeout in milliseconds to prevent hanging network calls
  REQUEST_TIMEOUT_MS: 12000,

  // Free tier rate limit advisory (Twelve Data allows ~8 requests/minute on free plan)
  RATE_LIMIT_ADVISORY: 'Twelve Data free plan allows ~8 calls/min. Cached data will be used where possible.',
} as const;
