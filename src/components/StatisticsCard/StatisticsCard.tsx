import React, { memo } from 'react';
import { StyleSheet, Text, useColorScheme, View } from 'react-native';
import { getThemeColors, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../constants/theme';

export interface StatisticsCardProps {
  label: string;
  value: string;
  valueColor?: string;
  badgeText?: string;
  badgeColor?: string;
  badgeBg?: string;
  subText?: string;
}

export const StatisticsCard = memo(function StatisticsCard({
  label,
  value,
  valueColor,
  badgeText,
  badgeColor,
  badgeBg,
  subText,
}: StatisticsCardProps) {
  const isDark = useColorScheme() === 'dark';
  const colors = getThemeColors(isDark);

  return (
    <View style={[styles.card, { backgroundColor: colors.surfaceSubtle, borderColor: colors.borderSubtle }]}>
      <View style={styles.content}>
        <View style={styles.labelRow}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
          {badgeText && (
            <View style={[styles.badge, { backgroundColor: badgeBg || colors.badgeBackground }]}>
              <Text style={[styles.badgeText, { color: badgeColor || colors.textMuted }]}>
                {badgeText}
              </Text>
            </View>
          )}
        </View>

        <Text style={[styles.value, { color: valueColor || colors.textPrimary }]}>
          {value}
        </Text>

        {subText && (
          <Text style={[styles.subText, { color: colors.textMuted }]}>
            {subText}
          </Text>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 140,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
  },
  content: {
    justifyContent: 'center',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xxs,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BORDER_RADIUS.xs,
  },
  badgeText: {
    fontSize: TYPOGRAPHY.sizes.xxs,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  value: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginTop: 2,
  },
  subText: {
    fontSize: TYPOGRAPHY.sizes.xxs,
    marginTop: 2,
  },
});
