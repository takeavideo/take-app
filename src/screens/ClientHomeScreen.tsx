import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { ProfessionalCard } from '@/components/ProfessionalCard';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { ServiceCard } from '@/components/ServiceCard';
import { BrandLogo } from '@/components/BrandLogo';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { getProfessionals, getServices } from '@/services/takeService';

export function ClientHomeScreen() {
  const router = useRouter();
  const professionals = getProfessionals();
  const services = getServices();

  return (
    <Screen>
      <View style={styles.topbar}>
        <View>
          <Text style={styles.greeting}>Olá 👋</Text>
          <Text style={styles.question}>O que você precisa produzir hoje?</Text>
        </View>
        <BrandLogo compact />
      </View>

      <View style={styles.heroCard}>
        <Text style={styles.heroEyebrow}>Foto e vídeo sob demanda</Text>
        <Text style={styles.heroTitle}>Chame um TAKE perto de você.</Text>
        <Button title="Solicitar agora" onPress={() => router.push('/service-request' as never)} />
      </View>

      <View style={styles.grid}>
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </View>

      <View style={styles.section}>
        <SectionHeader title="Profissionais perto de você" />
        <View style={styles.professionals}>
          {professionals.map((professional) => (
            <ProfessionalCard
              key={professional.id}
              professional={professional}
              onViewProfile={() => router.push(`/professional/${professional.id}` as never)}
            />
          ))}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topbar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  greeting: {
    color: colors.textMuted,
    fontSize: typography.size.md,
    fontWeight: '700',
  },
  question: {
    color: colors.text,
    fontSize: typography.size.xl,
    fontWeight: '900',
    maxWidth: 260,
    lineHeight: 31,
  },
  heroCard: {
    backgroundColor: colors.graphite,
    borderRadius: radius.xl,
    padding: spacing.xl,
    gap: spacing.md,
  },
  heroEyebrow: {
    color: colors.primary,
    fontSize: typography.size.sm,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: colors.surface,
    fontSize: typography.size.xl,
    fontWeight: '900',
    lineHeight: 32,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: '4%',
    rowGap: spacing.md,
  },
  section: {
    gap: spacing.md,
  },
  professionals: {
    gap: spacing.md,
  },
});
