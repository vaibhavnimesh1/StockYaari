import { useCallback, useEffect, useRef } from 'react';
import {
  fetchIntradayData,
  fetchStockData,
  selectFilteredCandles,
  selectStockState,
  selectStockStatistics,
  setOffline,
  setPeriod as setPeriodAction,
  setPeriodLoading,
  setSymbol as setSymbolAction,
  useAppDispatch,
  useAppSelector,
} from '../store';
import { Period } from '../types/stock';
import { useNetworkStatus } from './useNetworkStatus';

/**
 * Custom hook connecting Redux Toolkit store to the Historical Stock Dashboard.
 * Encapsulates dispatching RTK thunks, period selection, and auto-retry on reconnection.
 */
export function useStockDashboard(initialSymbol?: string) {
  const dispatch = useAppDispatch();
  const state = useAppSelector(selectStockState);
  const filteredCandles = useAppSelector(selectFilteredCandles);
  const statistics = useAppSelector(selectStockStatistics);

  const { isConnected } = useNetworkStatus();
  const inFlightPromiseRef = useRef<{ abort: () => void } | null>(null);

  // Set initial symbol if provided and different
  useEffect(() => {
    if (initialSymbol && initialSymbol.toUpperCase() !== state.symbol.toUpperCase()) {
      dispatch(setSymbolAction(initialSymbol));
    }
  }, [initialSymbol, state.symbol, dispatch]);

  // Sync offline connectivity to Redux store
  useEffect(() => {
    dispatch(setOffline(!isConnected));
  }, [isConnected, dispatch]);

  // Fetch stock data when symbol changes
  useEffect(() => {
    if (inFlightPromiseRef.current) {
      inFlightPromiseRef.current.abort();
    }

    const promise = dispatch(fetchStockData({ symbol: state.symbol, isRefresh: false }));
    inFlightPromiseRef.current = promise;

    return () => {
      promise.abort();
    };
  }, [state.symbol, dispatch]);

  // Period selector dispatch with smooth transition
  const setPeriod = useCallback(
    (period: Period) => {
      if (period === state.period) return;
      dispatch(setPeriodAction(period));

      if (period === '1D') {
        if (state.intradayCandles.length === 0) {
          dispatch(fetchIntradayData({ symbol: state.symbol }));
        } else {
          setTimeout(() => {
            dispatch(setPeriodLoading(false));
          }, 250);
        }
      } else {
        setTimeout(() => {
          dispatch(setPeriodLoading(false));
        }, 250);
      }
    },
    [dispatch, state.period, state.symbol, state.intradayCandles.length]
  );

  // Set active stock symbol
  const setSymbol = useCallback(
    (newSymbol: string) => {
      dispatch(setSymbolAction(newSymbol));
    },
    [dispatch]
  );

  // Manual pull-to-refresh
  const refresh = useCallback(() => {
    dispatch(fetchStockData({ symbol: state.symbol, isRefresh: true }));
    if (state.period === '1D') {
      dispatch(fetchIntradayData({ symbol: state.symbol }));
    }
  }, [dispatch, state.symbol, state.period]);

  // Auto-retry when connectivity is restored after being offline
  const wasOffline = useRef(false);
  useEffect(() => {
    if (state.isOffline) {
      wasOffline.current = true;
    } else if (wasOffline.current) {
      wasOffline.current = false;
      refresh();
    }
  }, [state.isOffline, refresh]);

  return {
    state,
    filteredCandles,
    statistics,
    setPeriod,
    setSymbol,
    refresh,
    retry: refresh,
    isPeriodLoading: state.isPeriodLoading,
  };
}
