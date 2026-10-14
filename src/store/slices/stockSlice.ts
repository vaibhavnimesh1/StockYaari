import { createAsyncThunk, createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CONFIG } from '../../constants/config';
import { getQuote, getTimeSeries, StockApiError } from '../../services/stockApi';
import { Candle, Period, StockQuote, StockStatistics } from '../../types/stock';
import { filterCandlesByPeriod } from '../../utils/periodUtils';
import {
  deriveStockStatistics,
  transformQuoteResponse,
  transformRawCandles,
} from '../../utils/stockDataTransformer';

export interface StockState {
  status: 'idle' | 'loading' | 'success' | 'error' | 'empty' | 'refreshing';
  symbol: string;
  period: Period;
  quote: StockQuote | null;
  candles: Candle[]; // 1Y daily candles
  intradayCandles: Candle[]; // 1D 5min candles
  currency: string;
  error: string | null;
  isOffline: boolean;
  isPeriodLoading: boolean;
}

const initialState: StockState = {
  status: 'idle',
  symbol: CONFIG.DEFAULT_SYMBOL,
  period: CONFIG.DEFAULT_PERIOD,
  quote: null,
  candles: [],
  intradayCandles: [],
  currency: 'USD',
  error: null,
  isOffline: false,
  isPeriodLoading: false,
};

/**
 * Async Thunk: Fetch 1Y daily candles and real-time quote concurrently
 */
export const fetchStockData = createAsyncThunk<
  {
    symbol: string;
    quote: StockQuote;
    candles: Candle[];
    currency: string;
  },
  { symbol: string; isRefresh?: boolean },
  { rejectValue: string }
>(
  'stock/fetchStockData',
  async ({ symbol, isRefresh = false }, { rejectWithValue, signal }) => {
    try {
      console.log(`🚀 [RTK Thunk] fetchStockData for: "${symbol}" (isRefresh: ${isRefresh})`);

      const [timeSeriesRes, quoteRes] = await Promise.all([
        getTimeSeries(
          symbol,
          CONFIG.DAILY_INTERVAL,
          CONFIG.DAILY_OUTPUT_SIZE,
          isRefresh,
          signal
        ),
        getQuote(symbol, isRefresh, signal),
      ]);

      const candles = transformRawCandles(timeSeriesRes.values, false);
      const currency = timeSeriesRes.meta?.currency || quoteRes.currency || 'USD';
      const quote = transformQuoteResponse(quoteRes, candles);

      console.log(`✨ [RTK Thunk] fetchStockData succeeded for: "${symbol}" (${candles.length} candles)`);

      return {
        symbol: symbol.toUpperCase().trim(),
        quote,
        candles,
        currency,
      };
    } catch (err: unknown) {
      console.error(`🚨 [RTK Thunk] fetchStockData failed for "${symbol}":`, err);
      if (err instanceof StockApiError) {
        return rejectWithValue(err.message);
      }
      const message = err instanceof Error ? err.message : 'Unable to load market data.';
      return rejectWithValue(message);
    }
  }
);

/**
 * Async Thunk: Fetch 1D intraday 5-min candles
 */
export const fetchIntradayData = createAsyncThunk<
  {
    symbol: string;
    intradayCandles: Candle[];
  },
  { symbol: string },
  { rejectValue: string }
>('stock/fetchIntradayData', async ({ symbol }, { rejectWithValue, signal }) => {
  try {
    console.log(`⏱️ [RTK Thunk] fetchIntradayData for: "${symbol}"`);
    const res = await getTimeSeries(
      symbol,
      CONFIG.INTRADAY_INTERVAL,
      CONFIG.INTRADAY_OUTPUT_SIZE,
      false,
      signal
    );
    const intradayCandles = transformRawCandles(res.values, true);
    return {
      symbol: symbol.toUpperCase().trim(),
      intradayCandles,
    };
  } catch (err: unknown) {
    console.warn(`⚠️ [RTK Thunk] fetchIntradayData failed for "${symbol}":`, err);
    if (err instanceof StockApiError) {
      return rejectWithValue(err.message);
    }
    const message = err instanceof Error ? err.message : 'Unable to load intraday data.';
    return rejectWithValue(message);
  }
});

export const stockSlice = createSlice({
  name: 'stock',
  initialState,
  reducers: {
    setPeriod: (state, action: PayloadAction<Period>) => {
      state.period = action.payload;
      state.isPeriodLoading = true;
    },
    setPeriodLoading: (state, action: PayloadAction<boolean>) => {
      state.isPeriodLoading = action.payload;
    },
    setSymbol: (state, action: PayloadAction<string>) => {
      const cleanSymbol = action.payload.toUpperCase().trim();
      state.symbol = cleanSymbol;
      state.period = CONFIG.DEFAULT_PERIOD;
      state.candles = [];
      state.intradayCandles = [];
      state.quote = null;
      state.error = null;
      state.status = 'loading';
      state.isPeriodLoading = false;
    },
    setOffline: (state, action: PayloadAction<boolean>) => {
      state.isOffline = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchStockData
    builder
      .addCase(fetchStockData.pending, (state, action) => {
        const isRefresh = action.meta.arg.isRefresh;
        state.status = isRefresh ? 'refreshing' : 'loading';
        state.error = null;
      })
      .addCase(fetchStockData.fulfilled, (state, action) => {
        state.symbol = action.payload.symbol;
        state.quote = action.payload.quote;
        state.candles = action.payload.candles;
        state.currency = action.payload.currency;
        state.error = null;
        state.status = action.payload.candles.length === 0 ? 'empty' : 'success';
      })
      .addCase(fetchStockData.rejected, (state, action) => {
        // Only set error if not aborted
        if (action.meta.aborted) return;
        state.status = 'error';
        state.error = action.payload || 'An error occurred while loading stock data.';
      });

    // fetchIntradayData
    builder
      .addCase(fetchIntradayData.pending, (state) => {
        state.isPeriodLoading = true;
      })
      .addCase(fetchIntradayData.fulfilled, (state, action) => {
        if (action.payload.symbol === state.symbol) {
          state.intradayCandles = action.payload.intradayCandles;
        }
        state.isPeriodLoading = false;
      })
      .addCase(fetchIntradayData.rejected, (state) => {
        state.isPeriodLoading = false;
      });
  },
});

export const { setPeriod, setPeriodLoading, setSymbol, setOffline, clearError } = stockSlice.actions;

// Selectors
type RootStateWithStock = { stock: StockState };

export const selectStockState = (state: RootStateWithStock): StockState => state.stock;

export const selectFilteredCandles = createSelector(
  [selectStockState],
  (stock): Candle[] => {
    return filterCandlesByPeriod(stock.candles, stock.period, stock.intradayCandles);
  }
);

export const selectStockStatistics = createSelector(
  [selectStockState, selectFilteredCandles],
  (stock, filteredCandles): StockStatistics => {
    return deriveStockStatistics(stock.quote, filteredCandles);
  }
);

export default stockSlice.reducer;
