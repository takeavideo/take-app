import { StyleSheet, Text } from 'react-native';

import { colors, radius, spacing, typography } from '@/constants/theme';

type MessageBoxProps = {
  message: string;
  tone?: 'info' | 'error' | 'success';
};

export function MessageBox({ message, tone = 'info' }: MessageBoxProps) {
  return <Text style={[styles.base, styles[tone]]}>{message}</Text>;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: typography.size.sm,
    fontWeight: '800',
    lineHeight: 20,
  },
  info: {
    backgroundColor: colors.surfaceWarm,
    color: colors.primaryDark,
  },
  error: {
    backgroundColor: '#FDEDEA',
    color: colors.danger,
  },
  success: {
    backgroundColor: '#EAF7F1',
    color: colors.success,
  },
});
