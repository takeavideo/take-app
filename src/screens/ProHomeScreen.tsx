import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { StatCard } from '@/components/StatCard';
import { colors, radius, shadows, spacing, typography } from '@/constants/theme';

export function ProHomeScreen() {
  const [online, setOnline] = useState(false);
  const router = useRouter();

  return (
    <Screen>
      <View>
        <Text style={styles.hello}>Olá, Lucas.</Text>
        <Text style={styles.subtitle}>Controle sua disponibilidade para novos TAKES.</Text>
      </View>

      <View style={[styles.onlineCard, online && styles.onlineCardActive]}>
        <Text style={styles.onlineStatus}>{online ? 'ONLINE' : 'OFFLINE'}</Text>
        <Text style={styles.onlineTitle}>{online ? 'Você está disponível para receber solicitações.' : 'FICAR ONLINE'}</Text>
        <Button title={online ? 'Ver solicitação exemplo' : 'FICAR ONLINE'} onPress={() => (online ? router.push('/request-received' as never) : setOnline(true))} />
      </View>

      <View style={styles.stats}>
        <StatCard value="R$ 1.480" label="Ganhos no mês" />
        <StatCard value="18" label="Trabalhos" />
        <StatCard value="4.9" label="Avaliação" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hello: {
    color: colors.text,
    fontSize: typography.size.xxl,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: typography.size.md,
    marginTop: spacing.xs,
  },
  onlineCard: {
    backgroundColor: colors.graphite,
    borderRadius: radius.xl,
    padding: spacing.xl,
    gap: spacing.lg,
    ...shadows.card,
  },
  onlineCardActive: {
    backgroundColor: '#12382C',
  },
  onlineStatus: {
    color: colors.primary,
    fontSize: typography.size.sm,
    fontWeight: '900',
  },
  onlineTitle: {
    color: colors.surface,
    fontSize: typography.size.xl,
    fontWeight: '900',
    lineHeight: 32,
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
});
