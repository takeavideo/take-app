import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandLogo } from '@/components/BrandLogo';
import { Button } from '@/components/Button';
import { MessageBox } from '@/components/MessageBox';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/providers/AuthProvider';
import { sendPasswordReset } from '@/services/authService';

export function ForgotPasswordScreen() {
  const { isConfigured } = useAuth();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [tone, setTone] = useState<'error' | 'success'>('success');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setMessage(null);
    if (!isConfigured) {
      setTone('error');
      setMessage('Configure o Supabase no arquivo .env para enviar recuperação de senha.');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordReset(email.trim());
      setTone('success');
      setMessage('Enviamos as instruções de recuperação para seu e-mail.');
    } catch (error) {
      setTone('error');
      setMessage(error instanceof Error ? error.message : 'Não foi possível enviar o e-mail.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <BrandLogo compact />
      <View style={styles.header}>
        <Text style={styles.title}>Esqueci minha senha</Text>
        <Text style={styles.subtitle}>Informe seu e-mail para receber um link de recuperação.</Text>
      </View>

      {message ? <MessageBox tone={tone} message={message} /> : null}

      <View style={styles.card}>
        <TextField label="E-mail" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <Button title={loading ? 'Enviando...' : 'Enviar recuperação'} onPress={handleSubmit} />
      </View>

      <Link href="/auth/sign-in" asChild>
        <Pressable style={styles.back}>
          <Text style={styles.backText}>Voltar para entrar</Text>
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
  back: {
    alignItems: 'center',
  },
  backText: {
    color: colors.primaryDark,
    fontSize: typography.size.sm,
    fontWeight: '900',
  },
});
