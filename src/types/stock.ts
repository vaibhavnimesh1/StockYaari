export type Period = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y';

export interface Candle {
  date: string; // Formatted "24 Sep 2026" or "10:30 AM" for intraday
  rawDate: string; // ISO date string or raw API datetime
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface FiftyTwoWeek {
  high: number;
  low: number;
  highChange?: number;
  lowChange?: number;
  highChangePercent?: number;
  lowChangePercent?: number;
  range?: string;
}

export interface StockQuote {
  symbol: string;
  name: string;
  exchange: string;
  currency: string;
  price: number;
  change: number;
  percentChange: number;
  previousClose: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  fiftyTwoWeek: FiftyTwoWeek;
  isMarketOpen?: boolean;
  datetime?: string;
}

export interface StockStatistics {
  open: number;
  high: number;
  low: number;
  previousClose: number;
  volume: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  currency: string;
}

export interface RawCandle {
  datetime: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
}

export interface TimeSeriesMeta {
  symbol: string;
  interval: string;
  currency: string;
  exchange_timezone: string;
  exchange: string;
  mic_code: string;
  type: string;
}

export interface TimeSeriesResponse {
  meta?: TimeSeriesMeta;
  values?: RawCandle[];
  status: string;
  code?: number;
  message?: string;
}

export interface QuoteApiResponse {
  symbol: string;
  name: string;
  exchange: string;
  mic_code?: string;
  currency: string;
  datetime: string;
  timestamp?: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  previous_close: string;
  change: string;
  percent_change: string;
  average_volume?: string;
  is_market_open?: boolean;
  fifty_two_week?: {
    low: string;
    high: string;
    low_change?: string;
    high_change?: string;
    low_change_percent?: string;
    high_change_percent?: string;
    range?: string;
  };
  status?: string;
  code?: number;
  message?: string;
}

export interface SymbolSearchResult {
  symbol: string;
  instrument_name: string;
  exchange: string;
  mic_code?: string;
  country: string;
  type: string;
  currency: string;
}

export interface SymbolSearchResponse {
  data?: SymbolSearchResult[];
  status: string;
  code?: number;
  message?: string;
}

export type DashboardStatus =
  | 'idle'
  | 'loading'
  | 'success'
  | 'error'
  | 'empty'
  | 'refreshing';

export interface DashboardState {
  status: DashboardStatus;
  symbol: string;
  period: Period;
  quote: StockQuote | null;
  candles: Candle[]; // 1Y daily candles
  intradayCandles: Candle[]; // 1D 5min candles
  currency: string;
  error: string | null;
  isOffline: boolean;
}
