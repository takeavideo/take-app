import { KeyboardTypeOptions, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/constants/theme';

type TextFieldProps = TextInputProps & {
  label: string;
  keyboardType?: KeyboardTypeOptions;
};

export function TextField({ label, style, ...props }: TextFieldProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.textMuted}
        style={[styles.input, props.multiline && styles.multiline, style]}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.sm,
  },
  label: {
    color: colors.text,
    fontSize: typography.size.sm,
    fontWeight: '900',
  },
  input: {
    minHeight: 52,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontSize: typography.size.md,
  },
  multiline: {
    minHeight: 118,
    paddingTop: spacing.md,
    lineHeight: 22,
  },
});
