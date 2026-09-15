import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BrandLogo } from '@/components/BrandLogo';
import { Button } from '@/components/Button';
import { MessageBox } from '@/components/MessageBox';
import { Screen } from '@/components/Screen';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/providers/AuthProvider';
import { signOut } from '@/services/authService';

type AccountProfileScreenProps = {
  mode: 'client' | 'professional';
};

export function AccountProfileScreen({ mode }: AccountProfileScreenProps) {
  const router = useRouter();
  const { profile, user, isConfigured } = useAuth();
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    setMessage(null);
    try {
      if (isConfigured) {
        await signOut();
      }
      router.replace('/auth/sign-in' as never);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Não foi possível sair.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <BrandLogo compact />
      <View style={styles.card}>
        <Text style={styles.title}>Perfil</Text>
        <Text style={styles.name}>{profile?.name ?? user?.email ?? 'Usuário TAKE'}</Text>
        <Text style={styles.description}>
          {mode === 'professional'
            ? 'Conta profissional preparada para receber solicitações.'
            : 'Conta cliente preparada para solicitar TAKES.'}
        </Text>
        <Text style={styles.badge}>{mode === 'professional' ? 'professional' : 'client'}</Text>
      </View>

      {message ? <MessageBox tone="error" message={message} /> : null}

      <Button title={loading ? 'Saindo...' : 'Sair da conta'} variant="secondary" onPress={handleLogout} />
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
  name: {
    color: colors.text,
    fontSize: typography.size.lg,
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
