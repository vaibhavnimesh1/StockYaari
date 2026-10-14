import React, { memo } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { CONFIG } from '../../constants/config';
import { getThemeColors, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../constants/theme';
import { Period } from '../../types/stock';

interface PeriodSelectorProps {
  selectedPeriod: Period;
  onSelectPeriod: (period: Period) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export const PeriodSelector = memo(function PeriodSelector({
  selectedPeriod,
  onSelectPeriod,
  disabled = false,
  isLoading = false,
}: PeriodSelectorProps) {
  const isDark = useColorScheme() === 'dark';
  const colors = getThemeColors(isDark);

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.segmentTrack, { backgroundColor: colors.surfaceElevated }]}>
        {CONFIG.PERIODS.map((period) => {
          const isSelected = selectedPeriod === period;
          return (
            <TouchableOpacity
              key={period}
              onPress={() => onSelectPeriod(period)}
              disabled={disabled}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`Filter by ${period}`}
              style={[
                styles.segmentItem,
                isSelected && [
                  styles.segmentItemSelected,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ],
              ]}
            >
              <View style={styles.labelContainer}>
                <Text
                  style={[
                    styles.segmentText,
                    { color: isSelected ? colors.primary : colors.textSecondary },
                    isSelected && styles.segmentTextSelected,
                  ]}
                >
                  {period}
                </Text>
                {isSelected && isLoading && (
                  <ActivityIndicator
                    size={10}
                    color={colors.primary}
                    style={styles.miniSpinner}
                  />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
    padding: SPACING.xs,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
  },
  segmentTrack: {
    flexDirection: 'row',
    borderRadius: BORDER_RADIUS.md,
    padding: 3,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: SPACING.xs + 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.sm,
  },
  segmentItemSelected: {
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  segmentTextSelected: {
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  miniSpinner: {
    marginLeft: 2,
  },
});
