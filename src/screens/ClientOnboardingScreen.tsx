import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BrandLogo } from '@/components/BrandLogo';
import { Button } from '@/components/Button';
import { MessageBox } from '@/components/MessageBox';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/providers/AuthProvider';
import { completeClientOnboarding } from '@/services/profileService';

export function ClientOnboardingScreen() {
  const router = useRouter();
  const { user, profile, refreshProfile, isConfigured } = useAuth();
  const [name, setName] = useState(profile?.name ?? user?.user_metadata?.name ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? user?.user_metadata?.phone ?? '');
  const [city, setCity] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!user) {
      router.replace('/auth/sign-in' as never);
      return;
    }

    if (!isConfigured) {
      router.replace('/client' as never);
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      await completeClientOnboarding({
        userId: user.id,
        email: user.email ?? '',
        name: name.trim(),
        phone: phone.trim(),
        city: city.trim(),
      });
      await refreshProfile();
      router.replace('/client' as never);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Não foi possível salvar seu perfil.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <BrandLogo compact />
      <View style={styles.header}>
        <Text style={styles.title}>Perfil do cliente</Text>
        <Text style={styles.subtitle}>Complete seus dados para chamar TAKES com mais rapidez.</Text>
      </View>

      {message ? <MessageBox tone="error" message={message} /> : null}

      <View style={styles.card}>
        <TextField label="Nome" value={name} onChangeText={setName} />
        <TextField label="Telefone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <TextField label="Cidade" value={city} onChangeText={setCity} />
        <Button title={loading ? 'Salvando...' : 'Entrar no TAKE'} onPress={handleSubmit} />
      </View>
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
});
