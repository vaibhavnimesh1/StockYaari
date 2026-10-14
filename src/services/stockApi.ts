import { CONFIG } from '../constants/config';
import {
  QuoteApiResponse,
  SymbolSearchResponse,
  SymbolSearchResult,
  TimeSeriesResponse,
} from '../types/stock';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// In-memory cache keyed by `${symbol}:${endpoint}:${interval}`
const memoryCache = new Map<string, CacheEntry<unknown>>();

/**
 * Cache helper to get valid unexpired data
 */
function getFromCache<T>(key: string): T | null {
  const entry = memoryCache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;

  const isExpired = Date.now() - entry.timestamp > CONFIG.CACHE_TTL_MS;
  if (isExpired) {
    memoryCache.delete(key);
    return null;
  }
  console.log(`⚡ [Cache Hit] Returning cached data for: ${key}`);
  return entry.data;
}

/**
 * Cache helper to set data with current timestamp
 */
function setInCache<T>(key: string, data: T): void {
  console.log(`💾 [Cache Store] Saved data for: ${key}`);
  memoryCache.set(key, { data, timestamp: Date.now() });
}

/**
 * Custom Error class for Twelve Data API errors
 */
export class StockApiError extends Error {
  code?: number;
  constructor(message: string, code?: number) {
    super(message);
    this.name = 'StockApiError';
    this.code = code;
  }
}

/**
 * Internal fetch wrapper with timeout and Twelve Data status check.
 * Handles the fact that Twelve Data often returns HTTP 200 with { status: "error", message, code }.
 */
async function apiFetch<T>(
  endpoint: string,
  params: Record<string, string | number>,
  signal?: AbortSignal
): Promise<T> {
  const apiKey = CONFIG.API_KEY;
  if (!apiKey) {
    console.error('❌ [API Error] API Key not configured');
    throw new StockApiError(
      'API Key not configured. Please set EXPO_PUBLIC_TWELVE_DATA_KEY or TWELVE_DATA_KEY in your .env file.',
      401
    );
  }

  const url = new URL(`${CONFIG.API_BASE_URL}${endpoint}`);
  url.searchParams.append('apikey', apiKey);

  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== null) {
      url.searchParams.append(key, String(val));
    }
  }

  console.log(`📡 [API Call] GET ${CONFIG.API_BASE_URL}${endpoint}`, params);

  // Timeout controller
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => {
    timeoutController.abort();
  }, CONFIG.REQUEST_TIMEOUT_MS);

  try {
    const combinedSignal = signal
      ? anySignal([signal, timeoutController.signal])
      : timeoutController.signal;

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: combinedSignal,
    });

    if (!response.ok) {
      console.warn(`⚠️ [API HTTP Error] ${endpoint} status: ${response.status}`);
      if (response.status === 429) {
        throw new StockApiError(
          'API rate limit reached (Twelve Data free tier allows ~8 calls/min). Please wait a moment and retry.',
          429
        );
      }
      throw new StockApiError(`HTTP error! status: ${response.status}`, response.status);
    }

    const json = (await response.json()) as {
      status?: string;
      code?: number;
      message?: string;
    };

    console.log(`📥 [API Response Data] ${endpoint}:`, JSON.stringify(json, null, 2));

    // Twelve Data specific error check on HTTP 200 responses
    if (json.status === 'error') {
      console.warn(`❌ [API Error Body] ${endpoint}:`, json);
      const code = json.code ?? 400;
      let message = json.message || 'An error occurred with the stock market API.';

      if (code === 429 || message.toLowerCase().includes('limit')) {
        message = 'Rate limit exceeded (~8 calls/min on free plan). Using cached data when available.';
      } else if (code === 400 || message.toLowerCase().includes('symbol')) {
        message = `Invalid stock symbol. ${message}`;
      } else if (code === 403 || message.toLowerCase().includes('grow') || message.toLowerCase().includes('plan')) {
        message = `Plan restriction: This symbol may require a paid Twelve Data market tier. (${message})`;
      }

      throw new StockApiError(message, code);
    }

    return json as T;
  } catch (error: unknown) {
    console.error(`🚨 [API Fetch Error] ${endpoint}:`, error);
    if (error instanceof StockApiError) {
      throw error;
    }
    if ((error as { name?: string })?.name === 'AbortError') {
      throw new StockApiError('Request timed out or was cancelled. Please check your network.', 408);
    }
    const message = error instanceof Error ? error.message : 'Network request failed';
    throw new StockApiError(message);
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Combines multiple AbortSignals safely
 */
function anySignal(signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController();
  for (const sig of signals) {
    if (sig.aborted) {
      controller.abort();
      return controller.signal;
    }
    sig.addEventListener('abort', () => controller.abort(), { once: true });
  }
  return controller.signal;
}

/**
 * Fetches Historical Time Series OHLCV data
 */
export async function getTimeSeries(
  symbol: string,
  interval: string = CONFIG.DAILY_INTERVAL,
  outputsize: number = CONFIG.DAILY_OUTPUT_SIZE,
  forceRefresh = false,
  signal?: AbortSignal
): Promise<TimeSeriesResponse> {
  const cacheKey = `${symbol.toUpperCase()}:time_series:${interval}:${outputsize}`;

  if (!forceRefresh) {
    const cached = getFromCache<TimeSeriesResponse>(cacheKey);
    if (cached) {
      return cached;
    }
  }

  const response = await apiFetch<TimeSeriesResponse>(
    '/time_series',
    {
      symbol: symbol.trim(),
      interval,
      outputsize,
    },
    signal
  );

  setInCache(cacheKey, response);
  return response;
}

/**
 * Fetches Real-Time Quote (company name, change, percent_change, fifty_two_week)
 */
export async function getQuote(
  symbol: string,
  forceRefresh = false,
  signal?: AbortSignal
): Promise<QuoteApiResponse> {
  const cacheKey = `${symbol.toUpperCase()}:quote`;

  if (!forceRefresh) {
    const cached = getFromCache<QuoteApiResponse>(cacheKey);
    if (cached) {
      return cached;
    }
  }

  const response = await apiFetch<QuoteApiResponse>(
    '/quote',
    { symbol: symbol.trim() },
    signal
  );

  setInCache(cacheKey, response);
  return response;
}

/**
 * Searches symbols matching the input query (e.g., AAPL, RELIANCE, TCS)
 */
export async function searchSymbols(
  query: string,
  signal?: AbortSignal
): Promise<SymbolSearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const cacheKey = `search:${trimmed.toUpperCase()}`;
  const cached = getFromCache<SymbolSearchResult[]>(cacheKey);
  if (cached) return cached;

  const response = await apiFetch<SymbolSearchResponse>(
    '/symbol_search',
    { symbol: trimmed },
    signal
  );

  const results = response.data || [];
  setInCache(cacheKey, results);
  return results;
}

/**
 * Clears the memory cache
 */
export function clearStockCache(): void {
  memoryCache.clear();
}
