import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { colors, radius, shadows, spacing, typography } from '@/constants/theme';
import { Professional } from '@/types/domain';
import { formatRating } from '@/utils/format';

type ProfessionalCardProps = {
  professional: Professional;
  onViewProfile: () => void;
};

export function ProfessionalCard({ professional, onViewProfile }: ProfessionalCardProps) {
  return (
    <Pressable style={styles.card} onPress={onViewProfile}>
      <Image source={{ uri: professional.imageUrl }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name}>{professional.name}</Text>
        <Text style={styles.specialty}>{professional.specialty}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.meta}>⭐ {formatRating(professional.rating)}</Text>
          <Text style={styles.meta}>{professional.distanceKm}</Text>
        </View>
        {professional.priceFrom ? <Text style={styles.price}>{professional.priceFrom}</Text> : null}
        {professional.verified ? <Text style={styles.verified}>Profissional verificado</Text> : null}
      </View>
      <Button title="Ver perfil" onPress={onViewProfile} style={styles.button} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    ...shadows.card,
  },
  image: {
    width: 62,
    height: 62,
    borderRadius: radius.lg,
    backgroundColor: colors.chip,
  },
  info: {
    flex: 1,
    gap: 3,
  },
  name: {
    color: colors.text,
    fontSize: typography.size.md,
    fontWeight: '900',
  },
  specialty: {
    color: colors.textMuted,
    fontSize: typography.size.sm,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  meta: {
    color: colors.text,
    fontSize: typography.size.sm,
    fontWeight: '700',
  },
  price: {
    color: colors.primaryDark,
    fontSize: typography.size.xs,
    fontWeight: '900',
  },
  verified: {
    color: colors.success,
    fontSize: typography.size.xs,
    fontWeight: '900',
  },
  button: {
    minHeight: 40,
    paddingHorizontal: spacing.md,
  },
});
