import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { colors, radius, shadows, spacing, typography } from '@/constants/theme';
import { getIncomingTake } from '@/services/takeService';

export function RequestReceivedScreen() {
  const router = useRouter();
  const take = getIncomingTake();

  return (
    <Screen scroll={false}>
      <View style={styles.wrapper}>
        <View style={styles.pulse}>
          <View style={styles.pulseInner}>
            <Text style={styles.pulseText}>TAKE</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.eyebrow}>Novo TAKE disponível</Text>
          <Text style={styles.title}>{take.type}</Text>
          <Text style={styles.duration}>{take.duration}</Text>

          <View style={styles.details}>
            <Detail label="Cliente" value={take.clientName} />
            <Detail label="Distância" value={take.distanceKm} />
            <Detail label="Descrição" value={take.description} />
          </View>

          <View style={styles.valueBox}>
            <Text style={styles.valueLabel}>Valor fictício</Text>
            <Text style={styles.value}>{take.value}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Button title="RECUSAR" variant="danger" onPress={() => router.back()} style={styles.actionButton} />
          <Button title="ACEITAR TAKE" onPress={() => router.push('/pro/index' as never)} style={styles.actionButton} />
        </View>
      </View>
    </Screen>
  );
}

type DetailProps = {
  label: string;
  value: string;
};

function Detail({ label, value }: DetailProps) {
  return (
    <View style={styles.detail}>
      <Text style={styles.detailLabel}>{label}:</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'space-between',
    gap: spacing.xl,
  },
  pulse: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  pulseInner: {
    width: 118,
    height: 118,
    borderRadius: 59,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 14,
    borderColor: '#FFE3AE',
  },
  pulseText: {
    color: colors.graphite,
    fontSize: typography.size.lg,
    fontWeight: '900',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    gap: spacing.md,
    ...shadows.card,
  },
  eyebrow: {
    color: colors.primaryDark,
    fontSize: typography.size.sm,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontSize: typography.size.xxl,
    fontWeight: '900',
  },
  duration: {
    color: colors.textMuted,
    fontSize: typography.size.lg,
    fontWeight: '800',
  },
  details: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  detail: {
    gap: spacing.xs,
  },
  detailLabel: {
    color: colors.textMuted,
    fontSize: typography.size.sm,
    fontWeight: '800',
  },
  detailValue: {
    color: colors.text,
    fontSize: typography.size.md,
    lineHeight: 23,
    fontWeight: '700',
  },
  valueBox: {
    marginTop: spacing.sm,
    backgroundColor: colors.surfaceWarm,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  valueLabel: {
    color: colors.primaryDark,
    fontSize: typography.size.sm,
    fontWeight: '900',
  },
  value: {
    color: colors.text,
    fontSize: typography.size.xl,
    fontWeight: '900',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
});
