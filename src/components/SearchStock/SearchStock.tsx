import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getThemeColors, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../../constants/theme';
import { useDebounce } from '../../hooks/useDebounce';
import { searchSymbols } from '../../services/stockApi';
import { SymbolSearchResult } from '../../types/stock';

interface SearchStockProps {
  visible: boolean;
  onClose: () => void;
  onSelectStock: (symbol: string) => void;
  currentSymbol: string;
}

const POPULAR_SYMBOLS = [
  { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ' },
  { symbol: 'TSLA', name: 'Tesla, Inc.', exchange: 'NASDAQ' },
  { symbol: 'AMZN', name: 'Amazon.com, Inc.', exchange: 'NASDAQ' },
];

export const SearchStock = memo(function SearchStock({
  visible,
  onClose,
  onSelectStock,
  currentSymbol,
}: SearchStockProps) {
  const isDark = useColorScheme() === 'dark';
  const colors = getThemeColors(isDark);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SymbolSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const debouncedQuery = useDebounce(query, 500);
  const searchIdRef = useRef(0);

  // Execute symbol search when debounced query updates
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setLoading(false);
      setSearchError(null);
      return;
    }

    const currentSearchId = ++searchIdRef.current;
    setLoading(true);
    setSearchError(null);

    console.log(`🔍 [SearchStock] Initiating search for query: "${debouncedQuery}"`);

    searchSymbols(debouncedQuery)
      .then((data) => {
        if (currentSearchId === searchIdRef.current) {
          console.log(`📋 [SearchStock] Results for "${debouncedQuery}" (${data.length} found):`, data);
          setResults(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (currentSearchId === searchIdRef.current) {
          console.error(`🚨 [SearchStock] Search error for "${debouncedQuery}":`, err);
          setSearchError(err instanceof Error ? err.message : 'Search failed');
          setLoading(false);
        }
      });
  }, [debouncedQuery]);

  const handleSelect = useCallback(
    (symbol: string) => {
      onSelectStock(symbol);
      setQuery('');
      onClose();
    },
    [onSelectStock, onClose]
  );

  const renderResultItem = useCallback(
    ({ item }: { item: SymbolSearchResult }) => {
      const isSelected = item.symbol.toUpperCase() === currentSymbol.toUpperCase();

      return (
        <TouchableOpacity
          onPress={() => handleSelect(item.symbol)}
          style={[
            styles.resultItem,
            { borderBottomColor: colors.borderSubtle },
            isSelected && { backgroundColor: colors.badgeBackground },
          ]}
          activeOpacity={0.7}
        >
          <View style={styles.resultLeft}>
            <Text style={[styles.resultSymbol, { color: colors.textPrimary }]}>
              {item.symbol}
            </Text>
            <Text
              style={[styles.resultName, { color: colors.textSecondary }]}
              numberOfLines={1}
            >
              {item.instrument_name}
            </Text>
          </View>

          <View style={styles.resultRight}>
            <View style={[styles.exchangeBadge, { backgroundColor: colors.badgeBackground }]}>
              <Text style={[styles.exchangeText, { color: colors.textMuted }]}>
                {item.exchange}
              </Text>
            </View>
            {item.currency && (
              <Text style={[styles.currencyText, { color: colors.textMuted }]}>
                {item.currency}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      );
    },
    [colors, currentSymbol, handleSelect]
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView
        style={[styles.modalContainer, { backgroundColor: colors.background }]}
        edges={['top', 'bottom', 'left', 'right']}
      >
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          {...(Platform.OS === 'android' ? { backgroundColor: colors.background } : {})}
        />
        {/* Header Bar */}
        <View style={[styles.headerBar, { borderBottomColor: colors.border }]}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            accessibilityLabel="Close search"
          >
            <Text style={[styles.closeIcon, { color: colors.textPrimary }]}>✕</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Search Stock
          </Text>
          <View style={{ width: 32 }} />
        </View>

        {/* Search Input Box */}
        <View style={styles.searchBoxWrapper}>
          <View
            style={[
              styles.inputContainer,
              { backgroundColor: colors.inputBackground, borderColor: colors.border },
            ]}
          >
            <Text style={styles.inputSearchIcon}>🔍</Text>
            <TextInput
              style={[styles.input, { color: colors.textPrimary }]}
              placeholder="Search symbol (e.g. AAPL, MSFT, TSLA)"
              placeholderTextColor={colors.textMuted}
              value={query}
              onChangeText={setQuery}
              autoCapitalize="characters"
              autoCorrect={false}
              autoFocus
              clearButtonMode="while-editing"
            />
            {loading && (
              <ActivityIndicator size="small" color={colors.primary} style={styles.spinner} />
            )}
          </View>
        </View>

        {/* Content Area */}
        <View style={styles.resultsContainer}>
          {/* Quick Picks / Popular Tickers if query is empty */}
          {query.trim().length === 0 ? (
            <View style={styles.quickPicksContainer}>
              <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>
                Popular Equities
              </Text>
              <View style={styles.chipGrid}>
                {POPULAR_SYMBOLS.map((item) => (
                  <TouchableOpacity
                    key={item.symbol}
                    onPress={() => handleSelect(item.symbol)}
                    style={[
                      styles.popularChip,
                      { backgroundColor: colors.surface, borderColor: colors.border },
                    ]}
                  >
                    <Text style={[styles.popularSymbol, { color: colors.textPrimary }]}>
                      {item.symbol}
                    </Text>
                    <Text
                      style={[styles.popularName, { color: colors.textMuted }]}
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : loading && results.length === 0 ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.statusText, { color: colors.textSecondary }]}>
                Searching Twelve Data markets...
              </Text>
            </View>
          ) : searchError ? (
            <View style={styles.centerContainer}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={[styles.statusText, { color: colors.textSecondary }]}>
                {searchError}
              </Text>
            </View>
          ) : results.length === 0 ? (
            <View style={styles.centerContainer}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                No Stocks Found
              </Text>
              <Text style={[styles.statusText, { color: colors.textSecondary }]}>
                No instruments matched "{query}". Try checking ticker spelling.
              </Text>
            </View>
          ) : (
            <FlatList
              data={results}
              renderItem={renderResultItem}
              keyExtractor={(item, idx) => `${item.symbol}-${item.exchange}-${idx}`}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
});

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  closeIcon: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  searchBoxWrapper: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    height: 48,
  },
  inputSearchIcon: {
    fontSize: 16,
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.md,
    height: '100%',
  },
  spinner: {
    marginLeft: SPACING.sm,
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  resultLeft: {
    flex: 1,
    paddingRight: SPACING.md,
  },
  resultSymbol: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  resultName: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: 2,
  },
  resultRight: {
    alignItems: 'flex-end',
  },
  exchangeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.xs,
  },
  exchangeText: {
    fontSize: TYPOGRAPHY.sizes.xxs,
    fontWeight: TYPOGRAPHY.weights.semiBold,
  },
  currencyText: {
    fontSize: TYPOGRAPHY.sizes.xxs,
    marginTop: 2,
  },
  quickPicksContainer: {
    marginTop: SPACING.md,
  },
  sectionHeading: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semiBold,
    marginBottom: SPACING.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chipGrid: {
    gap: SPACING.sm,
  },
  popularChip: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  popularSymbol: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  popularName: {
    fontSize: TYPOGRAPHY.sizes.xs,
    maxWidth: 200,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  statusText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: SPACING.sm,
  },
  errorIcon: {
    fontSize: 40,
    marginBottom: SPACING.sm,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING.xs,
  },
});
