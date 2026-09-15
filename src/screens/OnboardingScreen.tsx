import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BrandLogo } from '@/components/BrandLogo';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { colors, radius, spacing, typography } from '@/constants/theme';

const pages = [
  {
    title: 'Precisou de conteúdo?',
    description: 'Encontre fotógrafos e videomakers perto de você.',
  },
  {
    title: 'Conteúdo quando você precisar.',
    description: 'Sem contratação fixa. Sem complicação.',
  },
  {
    title: 'Chame um TAKE!',
    description: 'Escolha o serviço, encontre um profissional e produza.',
  },
];

export function OnboardingScreen() {
  const [page, setPage] = useState(0);
  const router = useRouter();
  const current = pages[page];
  const isLast = page === pages.length - 1;

  function handleNext() {
    if (isLast) {
      router.push('/auth/sign-in' as never);
      return;
    }

    setPage((value) => value + 1);
  }

  return (
    <Screen scroll={false}>
      <View style={styles.header}>
        <BrandLogo compact />
      </View>

      <View style={styles.content}>
        <View style={styles.visual}>
          <View style={styles.lensOuter}>
            <View style={styles.lensInner} />
          </View>
          <View style={styles.signalCard}>
            <Text style={styles.signalTitle}>TAKE próximo</Text>
            <Text style={styles.signalText}>2,4 km de distância</Text>
          </View>
        </View>

        <View style={styles.copy}>
          <Text style={styles.title}>{current.title}</Text>
          <Text style={styles.description}>{current.description}</Text>
        </View>

        <View style={styles.dots}>
          {pages.map((item, index) => (
            <View key={item.title} style={[styles.dot, page === index && styles.activeDot]} />
          ))}
        </View>
      </View>

      <Button title={isLast ? 'Começar' : 'Continuar'} onPress={handleNext} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'flex-start',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.xxl,
  },
  visual: {
    minHeight: 260,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  lensOuter: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: colors.graphite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lensInner: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: colors.primary,
    borderWidth: 14,
    borderColor: '#FFCE73',
  },
  signalCard: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.surfaceWarm,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#F2D4A2',
  },
  signalTitle: {
    color: colors.text,
    fontWeight: '900',
  },
  signalText: {
    color: colors.textMuted,
    fontSize: typography.size.xs,
  },
  copy: {
    gap: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: typography.size.xxl,
    fontWeight: '900',
    lineHeight: 39,
  },
  description: {
    color: colors.textMuted,
    fontSize: typography.size.md,
    lineHeight: 24,
  },
  dots: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  activeDot: {
    width: 28,
    backgroundColor: colors.primary,
  },
});
