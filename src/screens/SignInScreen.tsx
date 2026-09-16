import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandLogo } from '@/components/BrandLogo';
import { Button } from '@/components/Button';
import { MessageBox } from '@/components/MessageBox';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/providers/AuthProvider';
import { signInWithEmail } from '@/services/authService';

export function SignInScreen() {
  const router = useRouter();
  const { isConfigured, refreshProfile } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit() {
    setMessage(null);

    if (!isConfigured) {
      setMessage('Configure o Supabase no arquivo .env para testar login real.');
      return;
    }

    setLoading(true);
    try {
      const result = await signInWithEmail(email.trim(), password);
      await refreshProfile();
      if (result.profile.user_type === 'professional' && result.profileCreated) {
        router.replace('/professional-onboarding/index' as never);
        return;
      }

      router.replace((result.profile.user_type === 'professional' ? '/pro/index' : '/client/index') as never);
    } catch (error) {
      console.error('[TAKE sign-in screen] Falha no login', error);
      setMessage(error instanceof Error ? error.message : 'Não foi possível entrar.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <BrandLogo compact />
      <View style={styles.header}>
        <Text style={styles.title}>Entrar</Text>
        <Text style={styles.subtitle}>Acesse sua conta para chamar ou receber TAKES.</Text>
      </View>

      {message ? <MessageBox tone="error" message={message} /> : null}

      <View style={styles.card}>
        <TextField label="E-mail" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <TextField label="Senha" value={password} onChangeText={setPassword} secureTextEntry />
        <Button title={loading ? 'Entrando...' : 'Entrar'} onPress={handleSubmit} />

        <Link href="/auth/forgot-password" asChild>
          <Pressable>
            <Text style={styles.link}>Esqueci minha senha</Text>
          </Pressable>
        </Link>
      </View>

      <Link href="/auth/sign-up" asChild>
        <Pressable style={styles.secondaryCard}>
          <Text style={styles.secondaryText}>Ainda não tem conta? Criar conta</Text>
        </Pressable>
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: typography.size.xxl,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: typography.size.md,
    lineHeight: 23,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  link: {
    color: colors.primaryDark,
    fontSize: typography.size.sm,
    fontWeight: '900',
    textAlign: 'center',
  },
  secondaryCard: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  secondaryText: {
    color: colors.text,
    fontSize: typography.size.md,
    fontWeight: '800',
  },
});
