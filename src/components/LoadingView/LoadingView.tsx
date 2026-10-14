import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';
import { getThemeColors, SPACING, BORDER_RADIUS } from '../../constants/theme';

export function LoadingView() {
  const isDark = useColorScheme() === 'dark';
  const colors = getThemeColors(isDark);
  const opacityAnim = useRef(new Animated.Value(0.4)).current;

  // Gentle breathing skeleton pulse animation
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.9,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacityAnim]);

  return (
    <View style={styles.container}>
      {/* Skeleton 1: Header Card */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.headerTop}>
          <View>
            <Animated.View
              style={[
                styles.skeletonBlock,
                { width: 180, height: 26, backgroundColor: colors.skeletonBackground, opacity: opacityAnim },
              ]}
            />
            <Animated.View
              style={[
                styles.skeletonBlock,
                { width: 90, height: 16, backgroundColor: colors.skeletonBackground, opacity: opacityAnim, marginTop: 8 },
              ]}
            />
          </View>
          <Animated.View
            style={[
              styles.skeletonBlock,
              { width: 70, height: 32, borderRadius: BORDER_RADIUS.full, backgroundColor: colors.skeletonBackground, opacity: opacityAnim },
            ]}
          />
        </View>

        <Animated.View
          style={[
            styles.skeletonBlock,
            { width: 140, height: 36, backgroundColor: colors.skeletonBackground, opacity: opacityAnim, marginTop: 16 },
          ]}
        />
      </View>

      {/* Skeleton 2: Period Selector */}
      <View style={[styles.periodTrack, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Animated.View
          style={[
            styles.skeletonBlock,
            { width: '100%', height: 38, borderRadius: BORDER_RADIUS.md, backgroundColor: colors.skeletonBackground, opacity: opacityAnim },
          ]}
        />
      </View>

      {/* Skeleton 3: Chart Box */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Animated.View
          style={[
            styles.skeletonBlock,
            { width: 160, height: 20, backgroundColor: colors.skeletonBackground, opacity: opacityAnim },
          ]}
        />
        <Animated.View
          style={[
            styles.skeletonBlock,
            { width: '100%', height: 180, backgroundColor: colors.skeletonBackground, opacity: opacityAnim, marginTop: 16, borderRadius: BORDER_RADIUS.md },
          ]}
        />
      </View>

      {/* Skeleton 4: Stats Grid */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Animated.View
          style={[
            styles.skeletonBlock,
            { width: 140, height: 20, backgroundColor: colors.skeletonBackground, opacity: opacityAnim, marginBottom: 12 },
          ]}
        />
        <View style={styles.gridRow}>
          <Animated.View
            style={[styles.statBox, { backgroundColor: colors.skeletonBackground, opacity: opacityAnim }]}
          />
          <Animated.View
            style={[styles.statBox, { backgroundColor: colors.skeletonBackground, opacity: opacityAnim }]}
          />
        </View>
        <View style={styles.gridRow}>
          <Animated.View
            style={[styles.statBox, { backgroundColor: colors.skeletonBackground, opacity: opacityAnim }]}
          />
          <Animated.View
            style={[styles.statBox, { backgroundColor: colors.skeletonBackground, opacity: opacityAnim }]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.md,
  },
  card: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  skeletonBlock: {
    borderRadius: BORDER_RADIUS.sm,
  },
  periodTrack: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    padding: SPACING.xs,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
  },
  gridRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  statBox: {
    flex: 1,
    height: 60,
    borderRadius: BORDER_RADIUS.md,
  },
});
