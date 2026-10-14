export const PALETTE = {
  // Vibrant financial signals
  positive: '#10B981',
  positiveMuted: 'rgba(16, 185, 129, 0.15)',
  positiveGradientStart: '#10B981',
  positiveGradientEnd: 'rgba(16, 185, 129, 0.0)',

  negative: '#EF4444',
  negativeMuted: 'rgba(239, 68, 68, 0.15)',
  negativeGradientStart: '#EF4444',
  negativeGradientEnd: 'rgba(239, 68, 68, 0.0)',

  neutral: '#64748B',

  // Core brand accents
  primary: '#3B82F6',
  primaryMuted: 'rgba(59, 130, 246, 0.15)',
  accent: '#6366F1',

  // Dark Mode Palette (TradingView / Bloomberg Terminal elegance)
  dark: {
    background: '#0B0F19',
    surface: '#111827',
    surfaceElevated: '#1F2937',
    surfaceSubtle: '#1A2234',
    border: '#1F293D',
    borderSubtle: '#192233',
    textPrimary: '#F9FAFB',
    textSecondary: '#9CA3AF',
    textMuted: '#6B7280',
    cardBackground: '#111827',
    headerBackground: '#0B0F19',
    tableRowAlt: '#0E1424',
    badgeBackground: '#1F2937',
    inputBackground: '#1F2937',
    skeletonBackground: '#1E293B',
    skeletonHighlight: '#334155',
  },

  // Light Mode Palette
  light: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceElevated: '#F1F5F9',
    surfaceSubtle: '#F8FAFC',
    border: '#E2E8F0',
    borderSubtle: '#EDF2F7',
    textPrimary: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#94A3B8',
    cardBackground: '#FFFFFF',
    headerBackground: '#F8FAFC',
    tableRowAlt: '#F8FAFC',
    badgeBackground: '#EEF2F6',
    inputBackground: '#F1F5F9',
    skeletonBackground: '#E2E8F0',
    skeletonHighlight: '#CBD5E1',
  },
};

export const SPACING = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const BORDER_RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

export const TYPOGRAPHY = {
  sizes: {
    xxs: 10,
    xs: 12,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 30,
    huge: 36,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
    extraBold: '800' as const,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
} as const;

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
} as const;

export type ThemeMode = 'dark' | 'light';

export const getThemeColors = (isDarkMode: boolean) => {
  const scheme = isDarkMode ? PALETTE.dark : PALETTE.light;
  return {
    ...scheme,
    positive: PALETTE.positive,
    positiveMuted: PALETTE.positiveMuted,
    positiveGradientStart: PALETTE.positiveGradientStart,
    positiveGradientEnd: PALETTE.positiveGradientEnd,
    negative: PALETTE.negative,
    negativeMuted: PALETTE.negativeMuted,
    negativeGradientStart: PALETTE.negativeGradientStart,
    negativeGradientEnd: PALETTE.negativeGradientEnd,
    neutral: PALETTE.neutral,
    primary: PALETTE.primary,
    primaryMuted: PALETTE.primaryMuted,
    accent: PALETTE.accent,
  };
};

export type ThemeColors = ReturnType<typeof getThemeColors>;
