import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { BrandLogo } from '@/components/BrandLogo';
import { Button } from '@/components/Button';
import { MessageBox } from '@/components/MessageBox';
import { OptionPill } from '@/components/OptionPill';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/providers/AuthProvider';
import { completeProfessionalOnboarding } from '@/services/profileService';
import { uploadPortfolioImage } from '@/services/storageService';
import { ServiceTypeSlug } from '@/types/supabase';

const specialtyOptions: { label: string; value: ServiceTypeSlug }[] = [
  { label: 'Fotografia', value: 'photography' },
  { label: 'Vídeo', value: 'video' },
  { label: 'Foto + Vídeo', value: 'photo_video' },
  { label: 'Eventos', value: 'event' },
];

type EquipmentDraft = {
  name: string;
  category: string;
};

type PortfolioDraft = {
  localUri: string;
  mediaUrl?: string;
};

export function ProfessionalOnboardingScreen() {
  const router = useRouter();
  const { user, profile, refreshProfile, isConfigured } = useAuth();
  const [step, setStep] = useState(1);
  const [name, setName] = useState(profile?.name ?? user?.user_metadata?.name ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? user?.user_metadata?.phone ?? '');
  const [city, setCity] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [specialties, setSpecialties] = useState<ServiceTypeSlug[]>([]);
  const [bio, setBio] = useState('');
  const [equipment, setEquipment] = useState<EquipmentDraft[]>([]);
  const [equipmentName, setEquipmentName] = useState('');
  const [equipmentCategory, setEquipmentCategory] = useState('');
  const [portfolio, setPortfolio] = useState<PortfolioDraft[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function toggleSpecialty(value: ServiceTypeSlug) {
    setSpecialties((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    );
  }

  function addEquipment() {
    if (!equipmentName.trim()) return;
    setEquipment((current) => [
      ...current,
      { name: equipmentName.trim(), category: equipmentCategory.trim() || 'Equipamento' },
    ]);
    setEquipmentName('');
    setEquipmentCategory('');
  }

  async function pickPhoto() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setMessage('Permita acesso às fotos para adicionar portfólio.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (result.canceled) return;
    setPortfolio((current) => [
      ...current,
      ...result.assets.map((asset) => ({ localUri: asset.uri })),
    ]);
  }

  async function handleFinish() {
    if (!user) {
      router.replace('/auth/sign-in' as never);
      return;
    }

    if (!isConfigured) {
      router.replace('/pro' as never);
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const uploadedPortfolio = [];
      for (const item of portfolio) {
        const mediaUrl = item.mediaUrl ?? (await uploadPortfolioImage(user.id, item.localUri));
        uploadedPortfolio.push({ mediaUrl, mediaType: 'image' as const });
      }

      await completeProfessionalOnboarding({
        userId: user.id,
        email: user.email ?? '',
        name: name.trim(),
        phone: phone.trim(),
        city: city.trim(),
        neighborhood: neighborhood.trim(),
        specialties,
        bio: bio.trim(),
        equipment,
        portfolio: uploadedPortfolio,
      });
      await refreshProfile();
      router.replace('/pro' as never);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Não foi possível concluir seu perfil profissional.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <BrandLogo compact />
      <View style={styles.header}>
        <Text style={styles.kicker}>PASSO {step} de 6</Text>
        <Text style={styles.title}>{getStepTitle(step)}</Text>
      </View>

      {message ? <MessageBox tone="error" message={message} /> : null}

      <View style={styles.card}>{renderStep()}</View>

      <View style={styles.actions}>
        {step > 1 ? <Button title="Voltar" variant="secondary" onPress={() => setStep((value) => value - 1)} style={styles.actionButton} /> : null}
        <Button
          title={step === 6 ? (loading ? 'Salvando...' : 'Entrar no TAKE') : 'Continuar'}
          onPress={step === 6 ? handleFinish : () => setStep((value) => value + 1)}
          style={styles.actionButton}
        />
      </View>
    </Screen>
  );

  function renderStep() {
    if (step === 1) {
      return (
        <>
          <TextField label="Nome" value={name} onChangeText={setName} />
          <TextField label="Telefone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <TextField label="Cidade" value={city} onChangeText={setCity} />
          <TextField label="Bairro" value={neighborhood} onChangeText={setNeighborhood} />
        </>
      );
    }

    if (step === 2) {
      return (
        <View style={styles.options}>
          {specialtyOptions.map((item) => (
            <OptionPill
              key={item.value}
              label={item.label}
              selected={specialties.includes(item.value)}
              onPress={() => toggleSpecialty(item.value)}
            />
          ))}
        </View>
      );
    }

    if (step === 3) {
      return (
        <TextField
          label="Sobre você"
          value={bio}
          onChangeText={setBio}
          placeholder="Conte sua experiência, estilo de produção e tipos de trabalho que aceita."
          multiline
          textAlignVertical="top"
        />
      );
    }

    if (step === 4) {
      return (
        <>
          <TextField label="Equipamento" value={equipmentName} onChangeText={setEquipmentName} placeholder="Sony A7 IV" />
          <TextField label="Categoria" value={equipmentCategory} onChangeText={setEquipmentCategory} placeholder="Camera" />
          <Button title="Adicionar equipamento" variant="secondary" onPress={addEquipment} />
          <View style={styles.list}>
            {equipment.map((item) => (
              <Text key={`${item.name}-${item.category}`} style={styles.listItem}>
                {item.name} · {item.category}
              </Text>
            ))}
          </View>
        </>
      );
    }

    if (step === 5) {
      return (
        <>
          <Button title="Adicionar fotos" variant="secondary" onPress={pickPhoto} />
          <View style={styles.portfolioGrid}>
            {portfolio.map((item) => (
              <Image key={item.localUri} source={{ uri: item.localUri }} style={styles.portfolioImage} />
            ))}
          </View>
          <Text style={styles.helpText}>As imagens serão enviadas para o Supabase Storage ao concluir.</Text>
        </>
      );
    }

    return (
      <View style={styles.doneBox}>
        <Text style={styles.doneTitle}>Seu perfil TAKE está quase pronto.</Text>
        <Text style={styles.doneText}>Depois de entrar, você poderá ajustar valores, disponibilidade e portfólio.</Text>
      </View>
    );
  }
}

function getStepTitle(step: number) {
  const titles: Record<number, string> = {
    1: 'Dados pessoais',
    2: 'Especialidades',
    3: 'Sobre você',
    4: 'Equipamentos',
    5: 'Portfólio',
    6: 'Conclusão',
  };

  return titles[step];
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.xs,
  },
  kicker: {
    color: colors.primaryDark,
    fontSize: typography.size.sm,
    fontWeight: '900',
  },
  title: {
    color: colors.text,
    fontSize: typography.size.xxl,
    fontWeight: '900',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  list: {
    gap: spacing.sm,
  },
  listItem: {
    color: colors.text,
    backgroundColor: colors.chip,
    borderRadius: radius.md,
    padding: spacing.md,
    fontWeight: '800',
  },
  portfolioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  portfolioImage: {
    width: 86,
    height: 86,
    borderRadius: radius.md,
    backgroundColor: colors.chip,
  },
  helpText: {
    color: colors.textMuted,
    fontSize: typography.size.sm,
    lineHeight: 20,
  },
  doneBox: {
    gap: spacing.md,
  },
  doneTitle: {
    color: colors.text,
    fontSize: typography.size.xl,
    fontWeight: '900',
    lineHeight: 31,
  },
  doneText: {
    color: colors.textMuted,
    fontSize: typography.size.md,
    lineHeight: 23,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
});
