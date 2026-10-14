import React, { memo } from 'react';
import { StyleSheet, Text, useColorScheme, View } from 'react-native';
import { getThemeColors, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../../constants/theme';
import { StockQuote, StockStatistics } from '../../types/stock';
import { formatCompactVolume, formatCurrency, formatPercent } from '../../utils/numberFormatter';
import { StatisticsCard } from '../StatisticsCard';

interface StatisticsGridProps {
  statistics: StockStatistics;
  quote: StockQuote | null;
  currency: string;
}

export const StatisticsGrid = memo(function StatisticsGrid({
  statistics,
  quote,
  currency,
}: StatisticsGridProps) {
  const isDark = useColorScheme() === 'dark';
  const colors = getThemeColors(isDark);

  const currentPrice = quote?.price ?? statistics.previousClose;
  const highDiff = statistics.fiftyTwoWeekHigh > 0
    ? ((currentPrice - statistics.fiftyTwoWeekHigh) / statistics.fiftyTwoWeekHigh) * 100
    : 0;
  const lowDiff = statistics.fiftyTwoWeekLow > 0
    ? ((currentPrice - statistics.fiftyTwoWeekLow) / statistics.fiftyTwoWeekLow) * 100
    : 0;

  // Calculate position in 52W range (0% to 100%)
  const rangeSpan = statistics.fiftyTwoWeekHigh - statistics.fiftyTwoWeekLow;
  const rangePercent = rangeSpan > 0
    ? Math.max(0, Math.min(100, ((currentPrice - statistics.fiftyTwoWeekLow) / rangeSpan) * 100))
    : 50;

  return (
    <View style={styles.container}>
      {/* SECTION 1: Key Market Statistics (2-Column Grid) */}
      <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Today's Market Statistics
          </Text>
        </View>

        <View style={styles.gridRow}>
          <StatisticsCard
            label="Open"
            value={formatCurrency(statistics.open, { currency })}
          />
          <StatisticsCard
            label="High"
            value={formatCurrency(statistics.high, { currency })}
            valueColor={colors.positive}
            badgeText="Day High"
            badgeColor={colors.positive}
            badgeBg={colors.positiveMuted}
          />
        </View>

        <View style={styles.gridRow}>
          <StatisticsCard
            label="Low"
            value={formatCurrency(statistics.low, { currency })}
            valueColor={colors.negative}
            badgeText="Day Low"
            badgeColor={colors.negative}
            badgeBg={colors.negativeMuted}
          />
          <StatisticsCard
            label="Prev Close"
            value={formatCurrency(statistics.previousClose, { currency })}
          />
        </View>

        <View style={styles.gridRow}>
          <StatisticsCard
            label="Volume"
            value={formatCompactVolume(statistics.volume)}
            subText={statistics.volume > 0 ? `${statistics.volume.toLocaleString()} shares` : undefined}
          />
          <StatisticsCard
            label="Day Range"
            value={`${formatCurrency(statistics.low, { currency, decimals: 1 })} - ${formatCurrency(statistics.high, { currency, decimals: 1 })}`}
          />
        </View>
      </View>

      {/* SECTION 2: 52-Week Range & Historical Boundary Card */}
      <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            52-Week Range
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
            1 Year Trajectory
          </Text>
        </View>

        {/* Visual Range Bar */}
        <View style={styles.rangeBarContainer}>
          <View style={[styles.rangeTrack, { backgroundColor: colors.surfaceElevated }]}>
            <View
              style={[
                styles.rangeFill,
                { width: `${rangePercent}%`, backgroundColor: colors.primary },
              ]}
            />
          </View>
          <View style={styles.rangeLabelsRow}>
            <Text style={[styles.rangeBoundaryText, { color: colors.textSecondary }]}>
              52W Low: {formatCurrency(statistics.fiftyTwoWeekLow, { currency })}
            </Text>
            <Text style={[styles.rangeBoundaryText, { color: colors.textSecondary }]}>
              52W High: {formatCurrency(statistics.fiftyTwoWeekHigh, { currency })}
            </Text>
          </View>
        </View>

        <View style={styles.gridRow}>
          <StatisticsCard
            label="52W High"
            value={formatCurrency(statistics.fiftyTwoWeekHigh, { currency })}
            valueColor={colors.positive}
            badgeText={formatPercent(highDiff)}
            badgeColor={highDiff >= 0 ? colors.positive : colors.negative}
            badgeBg={highDiff >= 0 ? colors.positiveMuted : colors.negativeMuted}
            subText="From 52W Peak"
          />
          <StatisticsCard
            label="52W Low"
            value={formatCurrency(statistics.fiftyTwoWeekLow, { currency })}
            valueColor={colors.negative}
            badgeText={formatPercent(lowDiff)}
            badgeColor={lowDiff >= 0 ? colors.positive : colors.negative}
            badgeBg={lowDiff >= 0 ? colors.positiveMuted : colors.negativeMuted}
            subText="From 52W Trough"
          />
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.lg,
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  sectionCard: {
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    ...SHADOWS.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  sectionSubtitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  gridRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  rangeBarContainer: {
    marginBottom: SPACING.md,
  },
  rangeTrack: {
    height: 8,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
  },
  rangeFill: {
    height: '100%',
    borderRadius: BORDER_RADIUS.full,
  },
  rangeLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
  },
  rangeBoundaryText: {
    fontSize: TYPOGRAPHY.sizes.xxs,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
});
