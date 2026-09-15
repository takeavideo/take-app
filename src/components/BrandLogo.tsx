import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/constants/theme';

type BrandLogoProps = {
  compact?: boolean;
};

export function BrandLogo({ compact = false }: BrandLogoProps) {
  return (
    <View style={styles.wrapper}>
      <View style={[styles.mark, compact && styles.compactMark]}>
        <Text style={[styles.markText, compact && styles.compactMarkText]}>TAKE</Text>
      </View>
      {!compact && <Text style={styles.slogan}>Chame um TAKE!</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    gap: spacing.md,
  },
  mark: {
    backgroundColor: colors.graphite,
    borderRadius: radius.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  compactMark: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
  },
  markText: {
    color: colors.primary,
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: 0,
  },
  compactMarkText: {
    fontSize: 18,
  },
  slogan: {
    color: colors.textMuted,
    fontSize: typography.size.md,
    fontWeight: '700',
  },
});
