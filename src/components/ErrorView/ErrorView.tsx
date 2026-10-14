import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { getThemeColors, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../../constants/theme';

interface ErrorViewProps {
  message?: string | null;
  onRetry: () => void;
}

export function ErrorView({ message, onRetry }: ErrorViewProps) {
  const isDark = useColorScheme() === 'dark';
  const colors = getThemeColors(isDark);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Unable to load stock data.
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Something went wrong while fetching the latest market information.
        </Text>

        {message && (
          <View style={[styles.detailBox, { backgroundColor: colors.badgeBackground, borderColor: colors.borderSubtle }]}>
            <Text style={[styles.detailText, { color: colors.textMuted }]}>
              {message}
            </Text>
          </View>
        )}

        <TouchableOpacity
          onPress={onRetry}
          activeOpacity={0.8}
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          accessibilityRole="button"
          accessibilityLabel="Retry fetching stock data"
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SPACING.xl,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 350,
  },
  card: {
    width: '100%',
    padding: SPACING.xxl,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    alignItems: 'center',
    ...SHADOWS.md,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  detailBox: {
    width: '100%',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    marginBottom: SPACING.lg,
  },
  detailText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    textAlign: 'center',
    lineHeight: 18,
  },
  retryButton: {
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    minWidth: 160,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
});
