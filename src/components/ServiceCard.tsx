import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, shadows, spacing, typography } from '@/constants/theme';
import { ServiceOption } from '@/types/domain';

type ServiceCardProps = {
  service: ServiceOption;
};

export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <View style={styles.card}>
      <View style={[styles.dot, { backgroundColor: service.accent }]} />
      <Text style={styles.title}>{service.title}</Text>
      <Text style={styles.description}>{service.description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    minHeight: 132,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
    ...shadows.card,
  },
  dot: {
    width: 34,
    height: 6,
    borderRadius: radius.pill,
  },
  title: {
    color: colors.text,
    fontSize: typography.size.lg,
    fontWeight: '900',
  },
  description: {
    color: colors.textMuted,
    fontSize: typography.size.sm,
    lineHeight: 19,
  },
});
