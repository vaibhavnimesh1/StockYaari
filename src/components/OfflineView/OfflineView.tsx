import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { getThemeColors, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../../constants/theme';

interface OfflineViewProps {
  onRetry: () => void;
  isBannerOnly?: boolean;
}

export function OfflineView({ onRetry, isBannerOnly = false }: OfflineViewProps) {
  const isDark = useColorScheme() === 'dark';
  const colors = getThemeColors(isDark);

  if (isBannerOnly) {
    return (
      <View style={[styles.banner, { backgroundColor: '#EF4444' }]}>
        <Text style={styles.bannerText}>
          ⚡ Offline Mode — Showing cached market records
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={styles.icon}>📡</Text>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          No Internet Connection
        </Text>
        <Text style={[styles.message, { color: colors.textSecondary }]}>
          Please check your network connection. We will automatically retry when connectivity returns.
        </Text>

        <TouchableOpacity
          onPress={onRetry}
          activeOpacity={0.8}
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          accessibilityRole="button"
          accessibilityLabel="Retry connection"
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    paddingVertical: SPACING.xs + 2,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semiBold,
  },
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
  icon: {
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
    marginBottom: SPACING.lg,
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
