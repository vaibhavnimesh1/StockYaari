import React from 'react';
import { StyleSheet, Text, useColorScheme, View } from 'react-native';
import { getThemeColors, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../constants/theme';

interface EmptyViewProps {
  message?: string;
}

export function EmptyView({
  message = 'No historical data available for the selected period.',
}: EmptyViewProps) {
  const isDark = useColorScheme() === 'dark';
  const colors = getThemeColors(isDark);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={styles.emptyIcon}>📊</Text>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          No Data Found
        </Text>
        <Text style={[styles.message, { color: colors.textSecondary }]}>
          {message}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SPACING.xl,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 280,
  },
  card: {
    width: '100%',
    padding: SPACING.xxl,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING.xs,
  },
  message: {
    fontSize: TYPOGRAPHY.sizes.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
});
