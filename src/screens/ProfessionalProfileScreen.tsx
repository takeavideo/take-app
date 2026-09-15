import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { colors, radius, shadows, spacing, typography } from '@/constants/theme';
import { getProfessionalById } from '@/services/takeService';
import { formatRating } from '@/utils/format';

export function ProfessionalProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const professional = getProfessionalById(id ?? '');

  return (
    <Screen>
      <View style={styles.profileHeader}>
        <Image source={{ uri: professional.imageUrl }} style={styles.avatar} />
        <View style={styles.headerCopy}>
          <Text style={styles.name}>{professional.name}</Text>
          <Text style={styles.verified}>Profissional verificado</Text>
          <Text style={styles.meta}>
            ⭐ {formatRating(professional.rating)} · {professional.reviewCount} avaliações
          </Text>
          <Text style={styles.location}>{professional.location}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Especialidades</Text>
        <View style={styles.chips}>
          {professional.specialties.map((item) => (
            <Text key={item} style={styles.chip}>
              {item}
            </Text>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Equipamentos</Text>
        {professional.equipment.map((item) => (
          <Text key={item} style={styles.listItem}>
            {item}
          </Text>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Portfólio</Text>
        <View style={styles.portfolioGrid}>
          {professional.portfolio.map((item, index) => (
            <View key={item} style={styles.portfolioTile}>
              <Text style={styles.portfolioNumber}>0{index + 1}</Text>
              <Text style={styles.portfolioText}>{item}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.availability}>
        <Text style={styles.availabilityLabel}>Disponibilidade</Text>
        <Text style={styles.availabilityText}>{professional.availability}</Text>
      </View>

      <Button title="Chamar este profissional" onPress={() => router.push('/service-request' as never)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  profileHeader: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    flexDirection: 'row',
    gap: spacing.md,
    ...shadows.card,
  },
  avatar: {
    width: 92,
    height: 120,
    borderRadius: radius.lg,
    backgroundColor: colors.chip,
  },
  headerCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    color: colors.text,
    fontSize: typography.size.xl,
    fontWeight: '900',
  },
  verified: {
    alignSelf: 'flex-start',
    color: colors.success,
    backgroundColor: '#EAF7F1',
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radius.pill,
    fontSize: typography.size.xs,
    fontWeight: '900',
  },
  meta: {
    color: colors.text,
    fontSize: typography.size.sm,
    fontWeight: '800',
  },
  location: {
    color: colors.textMuted,
    fontSize: typography.size.sm,
    lineHeight: 20,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: typography.size.lg,
    fontWeight: '900',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    color: colors.text,
    backgroundColor: colors.chip,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontWeight: '800',
  },
  listItem: {
    color: colors.textMuted,
    fontSize: typography.size.md,
    lineHeight: 23,
  },
  portfolioGrid: {
    gap: spacing.sm,
  },
  portfolioTile: {
    minHeight: 82,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceWarm,
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  portfolioNumber: {
    color: colors.primaryDark,
    fontSize: typography.size.xs,
    fontWeight: '900',
  },
  portfolioText: {
    color: colors.text,
    fontSize: typography.size.md,
    fontWeight: '900',
  },
  availability: {
    backgroundColor: colors.graphite,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  availabilityLabel: {
    color: colors.primary,
    fontSize: typography.size.sm,
    fontWeight: '900',
  },
  availabilityText: {
    color: colors.surface,
    fontSize: typography.size.md,
    fontWeight: '800',
  },
});
