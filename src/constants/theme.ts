import '@/global.css';

import { Platform } from 'react-native';

export const colors = {
  background: '#F7F7F4',
  surface: '#FFFFFF',
  surfaceWarm: '#FFF8EC',
  primary: '#F5A524',
  primaryDark: '#C87305',
  graphite: '#171717',
  text: '#171717',
  textMuted: '#6D7178',
  line: '#E7E2D9',
  border: '#E6E4DE',
  success: '#23A26D',
  danger: '#D93A2F',
  chip: '#F0EEE8',
  shadow: '#141414',
} as const;

export const typography = {
  fontFamily: {
    regular: Platform.select({ web: 'Inter, system-ui, sans-serif', default: 'System' }),
    medium: Platform.select({ web: 'Inter, system-ui, sans-serif', default: 'System' }),
    bold: Platform.select({ web: 'Inter, system-ui, sans-serif', default: 'System' }),
  },
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 26,
    xxl: 34,
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 26,
  pill: 999,
} as const;

export const shadows = {
  card: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
  },
};

export const Colors = {
  light: {
    text: colors.text,
    background: colors.background,
    backgroundElement: colors.chip,
    backgroundSelected: colors.surfaceWarm,
    textSecondary: colors.textMuted,
  },
  dark: {
    text: colors.text,
    background: colors.background,
    backgroundElement: colors.chip,
    backgroundSelected: colors.surfaceWarm,
    textSecondary: colors.textMuted,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: spacing.xs,
  two: spacing.sm,
  three: spacing.lg,
  four: spacing.xl,
  five: spacing.xxl,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
