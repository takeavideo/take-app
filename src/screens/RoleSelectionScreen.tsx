import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandLogo } from '@/components/BrandLogo';
import { Screen } from '@/components/Screen';
import { colors, radius, shadows, spacing, typography } from '@/constants/theme';

const roles = [
  {
    title: 'Quero contratar',
    description: 'Encontre fotógrafos e videomakers.',
    route: '/client',
  },
  {
    title: 'Quero trabalhar',
    description: 'Receba oportunidades perto de você.',
    route: '/pro',
  },
];

export function RoleSelectionScreen() {
  const router = useRouter();

  return (
    <Screen>
      <BrandLogo compact />
      <View style={styles.copy}>
        <Text style={styles.title}>Como você quer usar o TAKE?</Text>
        <Text style={styles.subtitle}>Escolha seu modo de entrada para navegar no protótipo.</Text>
      </View>

      <View style={styles.cards}>
        {roles.map((role) => (
          <Pressable
            key={role.title}
            onPress={() => router.replace(role.route as never)}
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
          >
            <View style={styles.iconPlate}>
              <Text style={styles.icon}>{role.title.includes('contratar') ? '＋' : '▶'}</Text>
            </View>
            <View style={styles.cardCopy}>
              <Text style={styles.cardTitle}>{role.title}</Text>
              <Text style={styles.cardDescription}>{role.description}</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  copy: {
    gap: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: typography.size.xxl,
    fontWeight: '900',
    lineHeight: 39,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: typography.size.md,
    lineHeight: 23,
  },
  cards: {
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    ...shadows.card,
  },
  pressed: {
    opacity: 0.8,
  },
  iconPlate: {
    width: 50,
    height: 50,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceWarm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    color: colors.primaryDark,
    fontSize: 22,
    fontWeight: '900',
  },
  cardCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  cardTitle: {
    color: colors.text,
    fontSize: typography.size.lg,
    fontWeight: '900',
  },
  cardDescription: {
    color: colors.textMuted,
    fontSize: typography.size.sm,
  },
  arrow: {
    color: colors.primaryDark,
    fontSize: 30,
    fontWeight: '900',
  },
});
