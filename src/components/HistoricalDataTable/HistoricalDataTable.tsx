import React, { memo, useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { getThemeColors, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../../constants/theme';
import { Candle } from '../../types/stock';
import { formatCompactVolume, formatCurrency } from '../../utils/numberFormatter';

interface HistoricalDataTableProps {
  candles: Candle[];
  currency: string;
}

const COLUMN_WIDTHS = {
  date: 110,
  open: 85,
  high: 85,
  low: 85,
  close: 85,
  volume: 75,
};

const TABLE_WIDTH =
  COLUMN_WIDTHS.date +
  COLUMN_WIDTHS.open +
  COLUMN_WIDTHS.high +
  COLUMN_WIDTHS.low +
  COLUMN_WIDTHS.close +
  COLUMN_WIDTHS.volume +
  SPACING.md * 2;

/**
 * Memoized individual row component for 60fps virtualization performance
 */
interface TableRowProps {
  item: Candle;
  index: number;
  currency: string;
  isLatest: boolean;
}

const TableRow = memo(function TableRow({
  item,
  index,
  currency,
  isLatest,
}: TableRowProps) {
  const isDark = useColorScheme() === 'dark';
  const colors = getThemeColors(isDark);

  const isAltRow = index % 2 === 1;
  const rowBg = isLatest
    ? isDark
      ? 'rgba(59, 130, 246, 0.12)'
      : 'rgba(59, 130, 246, 0.08)'
    : isAltRow
    ? colors.tableRowAlt
    : 'transparent';

  const isBullishDay = item.close >= item.open;
  const closeColor = isBullishDay ? colors.positive : colors.negative;

  return (
    <View
      style={[
        styles.row,
        { backgroundColor: rowBg, borderBottomColor: colors.borderSubtle },
        isLatest && styles.latestRowBorder,
      ]}
    >
      {/* Date Column */}
      <View style={[styles.cell, { width: COLUMN_WIDTHS.date }]}>
        <Text style={[styles.cellText, styles.dateText, { color: colors.textPrimary }]}>
          {item.date}
        </Text>
        {isLatest && (
          <View style={[styles.latestBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.latestBadgeText}>Latest</Text>
          </View>
        )}
      </View>

      {/* Open */}
      <View style={[styles.cell, styles.cellRight, { width: COLUMN_WIDTHS.open }]}>
        <Text style={[styles.cellText, { color: colors.textSecondary }]}>
          {formatCurrency(item.open, { currency, decimals: 2 })}
        </Text>
      </View>

      {/* High */}
      <View style={[styles.cell, styles.cellRight, { width: COLUMN_WIDTHS.high }]}>
        <Text style={[styles.cellText, { color: colors.positive }]}>
          {formatCurrency(item.high, { currency, decimals: 2 })}
        </Text>
      </View>

      {/* Low */}
      <View style={[styles.cell, styles.cellRight, { width: COLUMN_WIDTHS.low }]}>
        <Text style={[styles.cellText, { color: colors.negative }]}>
          {formatCurrency(item.low, { currency, decimals: 2 })}
        </Text>
      </View>

      {/* Close */}
      <View style={[styles.cell, styles.cellRight, { width: COLUMN_WIDTHS.close }]}>
        <Text style={[styles.cellText, styles.boldCellText, { color: closeColor }]}>
          {formatCurrency(item.close, { currency, decimals: 2 })}
        </Text>
      </View>

      {/* Volume */}
      <View style={[styles.cell, styles.cellRight, { width: COLUMN_WIDTHS.volume }]}>
        <Text style={[styles.cellText, { color: colors.textMuted }]}>
          {formatCompactVolume(item.volume)}
        </Text>
      </View>
    </View>
  );
});

export const HistoricalDataTable = memo(function HistoricalDataTable({
  candles,
  currency,
}: HistoricalDataTableProps) {
  const isDark = useColorScheme() === 'dark';
  const colors = getThemeColors(isDark);

  const renderItem = useCallback(
    ({ item, index }: { item: Candle; index: number }) => (
      <TableRow
        item={item}
        index={index}
        currency={currency}
        isLatest={index === 0}
      />
    ),
    [currency]
  );

  const keyExtractor = useCallback((item: Candle) => item.rawDate, []);

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            Historical Price Data
          </Text>
          <Text style={[styles.cardSubtitle, { color: colors.textMuted }]}>
            OHLCV values ({candles.length} records)
          </Text>
        </View>
        <Text style={[styles.scrollHint, { color: colors.textMuted }]}>
          ← Scroll Horizontally →
        </Text>
      </View>

      {/* Horizontally scrollable wrapper */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled
        style={styles.horizontalScrollView}
      >
        <View style={{ width: TABLE_WIDTH }}>
          {/* Sticky Table Header */}
          <View
            style={[
              styles.headerRow,
              { backgroundColor: colors.surfaceElevated, borderBottomColor: colors.border },
            ]}
          >
            <View style={[styles.cell, { width: COLUMN_WIDTHS.date }]}>
              <Text style={[styles.headerText, { color: colors.textSecondary }]}>Date</Text>
            </View>
            <View style={[styles.cell, styles.cellRight, { width: COLUMN_WIDTHS.open }]}>
              <Text style={[styles.headerText, { color: colors.textSecondary }]}>Open</Text>
            </View>
            <View style={[styles.cell, styles.cellRight, { width: COLUMN_WIDTHS.high }]}>
              <Text style={[styles.headerText, { color: colors.textSecondary }]}>High</Text>
            </View>
            <View style={[styles.cell, styles.cellRight, { width: COLUMN_WIDTHS.low }]}>
              <Text style={[styles.headerText, { color: colors.textSecondary }]}>Low</Text>
            </View>
            <View style={[styles.cell, styles.cellRight, { width: COLUMN_WIDTHS.close }]}>
              <Text style={[styles.headerText, { color: colors.textSecondary }]}>Close</Text>
            </View>
            <View style={[styles.cell, styles.cellRight, { width: COLUMN_WIDTHS.volume }]}>
              <Text style={[styles.headerText, { color: colors.textSecondary }]}>Volume</Text>
            </View>
          </View>

          {/* Vertically virtualized FlashList for high performance with hundreds of rows */}
          <View style={styles.listContainer}>
            <FlashList
              data={candles}
              renderItem={renderItem}
              keyExtractor={keyExtractor}
              nestedScrollEnabled
              scrollEnabled={false} // Container outer ScrollView handles vertical scroll smoothly
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xxl,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  cardSubtitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: 2,
  },
  scrollHint: {
    fontSize: TYPOGRAPHY.sizes.xxs,
  },
  horizontalScrollView: {
    paddingBottom: SPACING.xs,
  },
  headerRow: {
    flexDirection: 'row',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
  },
  headerText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    height: 46,
  },
  latestRowBorder: {
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
  },
  cell: {
    justifyContent: 'center',
  },
  cellRight: {
    alignItems: 'flex-end',
  },
  cellText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  dateText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semiBold,
  },
  boldCellText: {
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  latestBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
    marginTop: 2,
  },
  latestBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  listContainer: {
    minHeight: 200,
  },
});
