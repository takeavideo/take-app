import { StyleSheet, Text, View } from 'react-native';

import { BrandLogo } from '@/components/BrandLogo';
import { Screen } from '@/components/Screen';
import { colors, radius, spacing, typography } from '@/constants/theme';

type PlaceholderTabScreenProps = {
  title: string;
  description: string;
};

export function PlaceholderTabScreen({ title, description }: PlaceholderTabScreenProps) {
  return (
    <Screen>
      <BrandLogo compact />
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        <Text style={styles.badge}>MVP visual</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 240,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.xl,
    justifyContent: 'center',
    gap: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: typography.size.xxl,
    fontWeight: '900',
  },
  description: {
    color: colors.textMuted,
    fontSize: typography.size.md,
    lineHeight: 24,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceWarm,
    color: colors.primaryDark,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    fontWeight: '900',
  },
});
