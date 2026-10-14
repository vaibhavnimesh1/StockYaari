import React, { memo } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { getThemeColors, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../../constants/theme';
import { StockQuote } from '../../types/stock';
import { formatCurrency, formatPercent } from '../../utils/numberFormatter';

interface StockHeaderProps {
  quote: StockQuote | null;
  currency: string;
  onSearchPress: () => void;
}

export const StockHeader = memo(function StockHeader({
  quote,
  currency,
  onSearchPress,
}: StockHeaderProps) {
  const isDark = useColorScheme() === 'dark';
  const colors = getThemeColors(isDark);

  if (!quote) return null;

  const isPositive = quote.change >= 0;
  const changeColor = isPositive ? colors.positive : colors.negative;
  const changeBg = isPositive ? colors.positiveMuted : colors.negativeMuted;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {/* Top Row: Symbol & Company + Search Button */}
      <View style={styles.topRow}>
        <View style={styles.titleContainer}>
          <Text style={[styles.symbolText, { color: colors.textPrimary }]} numberOfLines={1}>
            {quote.name || quote.symbol}
          </Text>
          <View style={styles.tickerBadgeContainer}>
            <View style={[styles.badge, { backgroundColor: colors.badgeBackground }]}>
              <Text style={[styles.badgeText, { color: colors.textSecondary }]}>
                {quote.exchange || 'EXCHANGE'}
              </Text>
            </View>
            <Text style={[styles.tickerText, { color: colors.textMuted }]}>
              {quote.symbol}
            </Text>
          </View>
        </View>

        {/* Change Stock / Search Button */}
        <TouchableOpacity
          onPress={onSearchPress}
          activeOpacity={0.7}
          style={[styles.searchButton, { backgroundColor: colors.badgeBackground, borderColor: colors.border }]}
          accessibilityLabel="Search or change stock"
          accessibilityRole="button"
        >
          <Text style={styles.searchIcon}>🔍</Text>
          <Text style={[styles.searchButtonText, { color: colors.primary }]}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Middle Row: Price & Today's Change */}
      <View style={styles.priceRow}>
        <Text style={[styles.priceText, { color: colors.textPrimary }]}>
          {formatCurrency(quote.price, { currency })}
        </Text>

        <View style={[styles.changeBadge, { backgroundColor: changeBg }]}>
          <Text style={[styles.changeText, { color: changeColor }]}>
            {isPositive ? '▲ +' : '▼ '}
            {formatCurrency(quote.change, { currency, showSign: false })} (
            {formatPercent(quote.percentChange)})
          </Text>
        </View>
      </View>

      {/* Bottom Category Tags (Inspired by modern FinTech chip design) */}
      <View style={styles.chipRow}>
        <View style={[styles.chip, { backgroundColor: colors.badgeBackground }]}>
          <Text style={[styles.chipText, { color: colors.textSecondary }]}>
            {currency.toUpperCase()}
          </Text>
        </View>
        <View style={[styles.chip, { backgroundColor: colors.badgeBackground }]}>
          <Text style={[styles.chipText, { color: colors.textSecondary }]}>
            {quote.isMarketOpen ? '● Market Open' : '○ Market Closed'}
          </Text>
        </View>
        <View style={[styles.chip, { backgroundColor: colors.badgeBackground }]}>
          <Text style={[styles.chipText, { color: colors.textSecondary }]}>
            EQUITY
          </Text>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    ...SHADOWS.sm,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
    paddingRight: SPACING.sm,
  },
  symbolText: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: -0.3,
  },
  tickerBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
    gap: SPACING.xs,
  },
  badge: {
    paddingHorizontal: SPACING.xs + 2,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.xs,
  },
  badgeText: {
    fontSize: TYPOGRAPHY.sizes.xxs,
    fontWeight: TYPOGRAPHY.weights.bold,
    textTransform: 'uppercase',
  },
  tickerText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    gap: SPACING.xs,
  },
  searchIcon: {
    fontSize: 13,
  },
  searchButtonText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semiBold,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: SPACING.md,
    gap: SPACING.sm,
    flexWrap: 'wrap',
  },
  priceText: {
    fontSize: TYPOGRAPHY.sizes.xxxl,
    fontWeight: TYPOGRAPHY.weights.extraBold,
    letterSpacing: -0.5,
  },
  changeBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs,
    borderRadius: BORDER_RADIUS.sm,
    alignSelf: 'center',
  },
  changeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginTop: SPACING.md,
    paddingTop: SPACING.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(150, 150, 150, 0.15)',
  },
  chip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
  },
  chipText: {
    fontSize: TYPOGRAPHY.sizes.xxs,
    fontWeight: TYPOGRAPHY.weights.semiBold,
  },
});
