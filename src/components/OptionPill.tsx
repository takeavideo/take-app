import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius, spacing, typography } from '@/constants/theme';

type OptionPillProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

export function OptionPill({ label, selected, onPress }: OptionPillProps) {
  return (
    <Pressable onPress={onPress} style={[styles.pill, selected && styles.selected]}>
      <Text style={[styles.text, selected && styles.selectedText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selected: {
    backgroundColor: colors.graphite,
    borderColor: colors.graphite,
  },
  text: {
    color: colors.text,
    fontSize: typography.size.sm,
    fontWeight: '800',
  },
  selectedText: {
    color: colors.primary,
  },
});
