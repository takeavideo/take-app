import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandLogo } from '@/components/BrandLogo';
import { Button } from '@/components/Button';
import { MessageBox } from '@/components/MessageBox';
import { OptionPill } from '@/components/OptionPill';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/providers/AuthProvider';
import { signUpWithEmail } from '@/services/authService';
import { UserType } from '@/types/supabase';

export function SignUpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ type?: UserType }>();
  const initialUserType = useMemo(
    () => (params.type === 'professional' ? 'professional' : 'client'),
    [params.type],
  );
  const { isConfigured, refreshProfile } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<UserType>(initialUserType);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setMessage(null);

    if (!isConfigured) {
      setMessage('Configure o Supabase no arquivo .env para testar cadastro real.');
      return;
    }

    if (!name.trim() || !email.trim() || password.length < 6) {
      setMessage('Informe nome, e-mail e uma senha com pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      await signUpWithEmail({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        userType,
      });
      await refreshProfile();
      router.replace(
        (userType === 'professional' ? '/professional-onboarding/index' : '/client-onboarding/index') as never,
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Não foi possível criar sua conta.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <BrandLogo compact />
      <View style={styles.header}>
        <Text style={styles.title}>Criar conta</Text>
        <Text style={styles.subtitle}>Entre no TAKE como cliente ou profissional.</Text>
      </View>

      {message ? <MessageBox tone="error" message={message} /> : null}

      <View style={styles.card}>
        <TextField label="Nome" value={name} onChangeText={setName} placeholder="Seu nome" />
        <TextField label="Telefone" value={phone} onChangeText={setPhone} placeholder="(00) 00000-0000" keyboardType="phone-pad" />
        <TextField label="E-mail" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <TextField label="Senha" value={password} onChangeText={setPassword} secureTextEntry />

        <View style={styles.typeBlock}>
          <Text style={styles.typeTitle}>Como você quer usar o TAKE?</Text>
          <View style={styles.options}>
            <OptionPill label="QUERO CONTRATAR" selected={userType === 'client'} onPress={() => setUserType('client')} />
            <OptionPill label="QUERO TRABALHAR" selected={userType === 'professional'} onPress={() => setUserType('professional')} />
          </View>
        </View>

        <Button title={loading ? 'Criando...' : 'Criar conta'} onPress={handleSubmit} />
      </View>

      <Link href="/auth/sign-in" asChild>
        <Pressable style={styles.secondaryCard}>
          <Text style={styles.secondaryText}>Já tenho conta</Text>
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
  typeBlock: {
    gap: spacing.md,
  },
  typeTitle: {
    color: colors.text,
    fontSize: typography.size.md,
    fontWeight: '900',
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  secondaryCard: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  secondaryText: {
    color: colors.primaryDark,
    fontSize: typography.size.sm,
    fontWeight: '900',
  },
});
