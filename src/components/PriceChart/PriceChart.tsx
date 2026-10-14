import React, { memo, useEffect, useMemo, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  Text,
  useColorScheme,
  useWindowDimensions,
  View,
} from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { getThemeColors, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../../constants/theme';
import { Candle, Period } from '../../types/stock';
import { formatChartAxisDate } from '../../utils/dateFormatter';
import { formatCurrency } from '../../utils/numberFormatter';

interface PriceChartProps {
  candles: Candle[];
  period: Period;
  currency: string;
  isLoading?: boolean;
}

export const PriceChart = memo(function PriceChart({
  candles,
  period,
  currency,
  isLoading = false,
}: PriceChartProps) {
  const isDark = useColorScheme() === 'dark';
  const colors = getThemeColors(isDark);
  const { width: windowWidth } = useWindowDimensions();

  // Pulse animation for skeleton overlay
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null;
    if (isLoading) {
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.85,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.35,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
    } else {
      pulseAnim.setValue(0.4);
    }
    return () => {
      if (animation) animation.stop();
    };
  }, [isLoading, pulseAnim]);

  // Responsive chart width
  const chartWidth = Math.max(windowWidth - SPACING.lg * 2 - 40, 260);

  // Candles from transformer are sorted newest-first. Reverse to chronological order for chart display
  const chronologicalCandles = useMemo(() => {
    return [...candles].reverse();
  }, [candles]);

  // Determine if trend is positive over the selected window
  const isPositiveTrend = useMemo(() => {
    if (chronologicalCandles.length < 2) return true;
    const first = chronologicalCandles[0].close;
    const last = chronologicalCandles[chronologicalCandles.length - 1].close;
    return last >= first;
  }, [chronologicalCandles]);

  const lineColor = isPositiveTrend ? colors.positive : colors.negative;
  const areaColor = isPositiveTrend ? colors.positiveMuted : colors.negativeMuted;

  // Memoize gifted-charts data structure with interactive pointer tooltips
  const chartData = useMemo(() => {
    if (chronologicalCandles.length < 2) return [];

    // Sub-sample points if dataset is very large (e.g., 365 daily candles) to keep rendering ultra smooth
    const maxPoints = 80;
    const step = Math.max(1, Math.floor(chronologicalCandles.length / maxPoints));

    const sampled = chronologicalCandles.filter(
      (_, index) => index % step === 0 || index === chronologicalCandles.length - 1
    );

    const labelInterval = Math.max(1, Math.floor(sampled.length / 5));

    return sampled.map((candle, index) => {
      const showLabel = index % labelInterval === 0 || index === sampled.length - 1;
      return {
        value: candle.close,
        label: showLabel ? formatChartAxisDate(candle.rawDate, period) : '',
        labelTextStyle: {
          color: colors.textMuted,
          fontSize: 9,
        },
        dataPointText: '',
        date: candle.date,
        rawDate: candle.rawDate,
      };
    });
  }, [chronologicalCandles, period, colors.textMuted]);

  // If loading and no previous chart data exists, display dedicated chart skeleton box
  if (chartData.length < 2 && isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.chartHeaderRow}>
          <View>
            <Text style={[styles.chartTitle, { color: colors.textPrimary }]}>
              Historical Price Chart
            </Text>
            <Text style={[styles.chartSubtitle, { color: colors.textMuted }]}>
              Loading {period} price trend...
            </Text>
          </View>
          <View style={[styles.updatingBadge, { backgroundColor: colors.badgeBackground, borderColor: colors.border }]}>
            <ActivityIndicator size={12} color={colors.primary} />
            <Text style={[styles.updatingText, { color: colors.primary }]}>Loading {period}</Text>
          </View>
        </View>

        <View style={styles.skeletonWrapper}>
          <View style={[styles.skeletonGuideLine, { borderColor: colors.borderSubtle }]} />
          <View style={[styles.skeletonGuideLine, { borderColor: colors.borderSubtle }]} />
          <View style={[styles.skeletonGuideLine, { borderColor: colors.borderSubtle }]} />
          <Animated.View
            style={[
              styles.skeletonBlock,
              { backgroundColor: colors.skeletonBackground, opacity: pulseAnim },
            ]}
          />
        </View>
      </View>
    );
  }

  // Fallback: Handle too few data points gracefully (< 2 points)
  if (chartData.length < 2) {
    return (
      <View
        style={[
          styles.container,
          styles.emptyContainer,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.emptyIcon, { color: colors.textMuted }]}>📉</Text>
        <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
          Insufficient Chart Data
        </Text>
        <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
          At least 2 historical price points are required to render the chart for {period}.
        </Text>
      </View>
    );
  }

  // Calculate dynamic min and max for chart Y-axis scaling
  const values = chartData.map((d) => d.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const padding = (maxVal - minVal) * 0.1 || 1;
  const yAxisOffset = Math.max(0, Math.floor(minVal - padding));

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.chartHeaderRow}>
        <View>
          <Text style={[styles.chartTitle, { color: colors.textPrimary }]}>
            Historical Price Chart
          </Text>
          <Text style={[styles.chartSubtitle, { color: colors.textMuted }]}>
            Closing price trend ({period})
          </Text>
        </View>

        {isLoading ? (
          <View style={[styles.updatingBadge, { backgroundColor: colors.badgeBackground, borderColor: colors.border }]}>
            <ActivityIndicator size={12} color={colors.primary} />
            <Text style={[styles.updatingText, { color: colors.primary }]}>Updating {period}...</Text>
          </View>
        ) : (
          <View style={[styles.trendBadge, { backgroundColor: isPositiveTrend ? colors.positiveMuted : colors.negativeMuted }]}>
            <Text style={[styles.trendText, { color: lineColor }]}>
              {isPositiveTrend ? '▲ Bullish' : '▼ Bearish'}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.chartWrapper}>
        <LineChart
          data={chartData}
          width={chartWidth}
          height={200}
          color={lineColor}
          thickness={2.5}
          startFillColor={lineColor}
          endFillColor={areaColor}
          startOpacity={0.35}
          endOpacity={0.02}
          areaChart
          yAxisOffset={yAxisOffset}
          noOfSections={4}
          yAxisColor="transparent"
          xAxisColor={colors.border}
          yAxisTextStyle={{ color: colors.textMuted, fontSize: 10 }}
          formatYLabel={(val) => formatCurrency(parseFloat(val), { currency, decimals: 0 })}
          hideDataPoints
          curved
          isAnimated
          animationDuration={500}
          pointerConfig={{
            pointerStripHeight: 180,
            pointerStripColor: colors.textSecondary,
            pointerStripWidth: 1.5,
            pointerColor: lineColor,
            radius: 5,
            pointerLabelWidth: 110,
            pointerLabelHeight: 52,
            activatePointersOnLongPress: false,
            autoAdjustPointerLabelPosition: true,
            pointerLabelComponent: (items: any) => {
              const item = items[0];
              if (!item) return null;
              return (
                <View style={[styles.tooltipContainer, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                  <Text style={[styles.tooltipPrice, { color: colors.textPrimary }]}>
                    {formatCurrency(item.value, { currency })}
                  </Text>
                  <Text style={[styles.tooltipDate, { color: colors.textSecondary }]}>
                    {item.date || item.label}
                  </Text>
                </View>
              );
            },
          }}
        />

        {/* Shimmer / Skeleton Loading Overlay over Chart during period change */}
        {isLoading && (
          <View
            style={[
              styles.chartOverlay,
              { backgroundColor: isDark ? 'rgba(15, 23, 42, 0.70)' : 'rgba(255, 255, 255, 0.70)' },
            ]}
          >
            <Animated.View
              style={[
                styles.shimmerWave,
                {
                  backgroundColor: colors.primary,
                  opacity: pulseAnim,
                },
              ]}
            />
            <View style={[styles.overlayContentBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={[styles.overlayLoadingText, { color: colors.textPrimary }]}>
                Rendering {period} data...
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    ...SHADOWS.sm,
    position: 'relative',
    overflow: 'hidden',
  },
  chartHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  chartTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  chartSubtitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: 2,
  },
  trendBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.sm,
  },
  trendText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  updatingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
  },
  updatingText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semiBold,
  },
  chartWrapper: {
    alignItems: 'center',
    paddingTop: SPACING.xs,
    marginLeft: -10,
    position: 'relative',
  },
  chartOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.md,
  },
  shimmerWave: {
    position: 'absolute',
    top: '35%',
    left: 10,
    right: 10,
    height: 4,
    borderRadius: 2,
  },
  overlayContentBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    ...SHADOWS.md,
  },
  overlayLoadingText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semiBold,
  },
  skeletonWrapper: {
    height: 200,
    justifyContent: 'space-around',
    paddingVertical: SPACING.md,
    position: 'relative',
  },
  skeletonGuideLine: {
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    width: '100%',
  },
  skeletonBlock: {
    position: 'absolute',
    left: 10,
    right: 10,
    top: 40,
    height: 120,
    borderRadius: BORDER_RADIUS.md,
  },
  tooltipContainer: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    alignItems: 'center',
    ...SHADOWS.md,
  },
  tooltipPrice: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  tooltipDate: {
    fontSize: TYPOGRAPHY.sizes.xxs,
    marginTop: 2,
  },
  emptyContainer: {
    paddingVertical: SPACING.xxxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
  },
});
