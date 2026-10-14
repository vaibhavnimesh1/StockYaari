import React, { useCallback, useState } from 'react';
import {
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyView } from '../../components/EmptyView';
import { ErrorView } from '../../components/ErrorView';
import { HistoricalDataTable } from '../../components/HistoricalDataTable';
import { LoadingView } from '../../components/LoadingView';
import { OfflineView } from '../../components/OfflineView';
import { PeriodSelector } from '../../components/PeriodSelector';
import { PriceChart } from '../../components/PriceChart';
import { SearchStock } from '../../components/SearchStock';
import { StatisticsGrid } from '../../components/StatisticsGrid';
import { StockHeader } from '../../components/StockHeader';
import { getThemeColors, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../constants/theme';
import { useStockDashboard } from '../../hooks/useStockDashboard';

export function HistoricalStockDashboard() {
  const isDark = useColorScheme() === 'dark';
  const colors = getThemeColors(isDark);

  const {
    state,
    filteredCandles,
    statistics,
    setPeriod,
    setSymbol,
    refresh,
    retry,
    isPeriodLoading,
  } = useStockDashboard();

  const [searchModalVisible, setSearchModalVisible] = useState(false);

  const handleOpenSearch = useCallback(() => {
    setSearchModalVisible(true);
  }, []);

  const handleCloseSearch = useCallback(() => {
    setSearchModalVisible(false);
  }, []);

  const handleSelectStock = useCallback(
    (newSymbol: string) => {
      setSymbol(newSymbol);
    },
    [setSymbol]
  );

  const hasData = state.quote !== null && state.candles.length > 0;
  const isRefreshing = state.status === 'refreshing';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'bottom', 'left', 'right']}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        {...(Platform.OS === 'android' ? { backgroundColor: colors.background } : {})}
      />

      {/* Top App Header */}
      <View style={[styles.topBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.topBarLeft}>
          <Text style={[styles.appBrandText, { color: colors.primary }]}>StockYaari</Text>
          <Text style={[styles.appSubBrandText, { color: colors.textMuted }]}>Markets</Text>
        </View>

        <TouchableOpacity
          onPress={handleOpenSearch}
          style={[styles.topSearchButton, { backgroundColor: colors.badgeBackground, borderColor: colors.border }]}
          activeOpacity={0.7}
          accessibilityLabel="Open stock search"
        >
          <Text style={styles.searchIcon}>🔍</Text>
          <Text style={[styles.searchText, { color: colors.textSecondary }]}>
            {state.symbol}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Offline Alert Banner */}
      {state.isOffline && <OfflineView onRetry={refresh} isBannerOnly />}

      {/* Main Scrollable Content with Pull-to-Refresh */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* State 1: Offline Full Screen (when no data in memory) */}
        {state.isOffline && !hasData ? (
          <OfflineView onRetry={retry} />
        ) : state.status === 'loading' && !hasData ? (
          /* State 2: Initial Skeleton Loading */
          <LoadingView />
        ) : state.status === 'error' && !hasData ? (
          /* State 3: API Error Screen */
          <ErrorView message={state.error} onRetry={retry} />
        ) : state.status === 'empty' && !hasData ? (
          /* State 4: Empty Historical Data */
          <EmptyView />
        ) : (
          /* State 5: Active Market Dashboard */
          <>
            {/* A. Stock Header Card */}
            <StockHeader
              quote={state.quote}
              currency={state.currency}
              onSearchPress={handleOpenSearch}
            />

            {/* B. Period Filter Selector */}
            <PeriodSelector
              selectedPeriod={state.period}
              onSelectPeriod={setPeriod}
              disabled={state.status === 'loading'}
              isLoading={isPeriodLoading}
            />

            {/* C. Historical Price Line Chart */}
            <PriceChart
              candles={filteredCandles}
              period={state.period}
              currency={state.currency}
              isLoading={isPeriodLoading}
            />

            {/* D. Statistics Grid (Today's Stats & 52-Week Range) */}
            <StatisticsGrid
              statistics={statistics}
              quote={state.quote}
              currency={state.currency}
            />

            {/* E. Virtualized Historical OHLCV Table */}
            <HistoricalDataTable
              candles={filteredCandles}
              currency={state.currency}
            />
          </>
        )}
      </ScrollView>

      {/* Stock Search Modal */}
      <SearchStock
        visible={searchModalVisible}
        onClose={handleCloseSearch}
        onSelectStock={handleSelectStock}
        currentSymbol={state.symbol}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm + 2,
    borderBottomWidth: 1,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: SPACING.xs,
  },
  appBrandText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.extraBold,
    letterSpacing: -0.5,
  },
  appSubBrandText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semiBold,
    textTransform: 'uppercase',
  },
  topSearchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    gap: SPACING.xs,
  },
  searchIcon: {
    fontSize: 12,
  },
  searchText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xxxl,
  },
});
