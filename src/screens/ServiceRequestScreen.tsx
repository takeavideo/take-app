import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/Button';
import { OptionPill } from '@/components/OptionPill';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { colors, radius, spacing, typography } from '@/constants/theme';

const serviceTypes = ['Foto', 'Vídeo', 'Foto + Vídeo'];
const whenOptions = ['Agora', 'Hoje', 'Agendar'];
const durationOptions = ['30 minutos', '1 hora', '2 horas', '4 horas'];

export function ServiceRequestScreen() {
  const router = useRouter();
  const [service, setService] = useState(serviceTypes[0]);
  const [when, setWhen] = useState(whenOptions[0]);
  const [duration, setDuration] = useState(durationOptions[1]);
  const [description, setDescription] = useState('');

  return (
    <Screen>
      <SectionHeader
        title="Solicitação de serviço"
        subtitle="Conte o básico para encontrarmos profissionais disponíveis por perto."
      />

      <Question title="O que você precisa?">
        {serviceTypes.map((item) => (
          <OptionPill key={item} label={item} selected={service === item} onPress={() => setService(item)} />
        ))}
      </Question>

      <Question title="Quando?">
        {whenOptions.map((item) => (
          <OptionPill key={item} label={item} selected={when === item} onPress={() => setWhen(item)} />
        ))}
      </Question>

      <Question title="Quanto tempo?">
        {durationOptions.map((item) => (
          <OptionPill key={item} label={item} selected={duration === item} onPress={() => setDuration(item)} />
        ))}
      </Question>

      <View style={styles.card}>
        <Text style={styles.label}>Local</Text>
        <View style={styles.locationField}>
          <Text style={styles.locationIcon}>⌖</Text>
          <Text style={styles.locationText}>Usar minha localização</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Descreva o que deseja produzir</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Ex.: preciso gravar conteúdos para Instagram durante meu treino."
          placeholderTextColor={colors.textMuted}
          multiline
          style={styles.textArea}
          textAlignVertical="top"
        />
      </View>

      <Button title="Encontrar profissionais" onPress={() => router.push('/client' as never)} />
    </Screen>
  );
}

type QuestionProps = {
  title: string;
  children: React.ReactNode;
};

function Question({ title, children }: QuestionProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{title}</Text>
      <View style={styles.options}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  label: {
    color: colors.text,
    fontSize: typography.size.lg,
    fontWeight: '900',
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  locationField: {
    minHeight: 52,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceWarm,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  locationIcon: {
    color: colors.primaryDark,
    fontSize: 20,
    fontWeight: '900',
  },
  locationText: {
    color: colors.text,
    fontSize: typography.size.md,
    fontWeight: '800',
  },
  textArea: {
    minHeight: 120,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    color: colors.text,
    fontSize: typography.size.md,
    lineHeight: 22,
  },
});
