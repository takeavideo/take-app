import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { MessageBox } from '@/components/MessageBox';
import { Screen } from '@/components/Screen';
import { colors, radius, shadows, spacing, typography } from '@/constants/theme';
import {
  PublicProfessionalProfile,
  cancelServiceRequest,
  getPublicProfessionalProfile,
  getServiceRequestForClient,
} from '@/services/marketplaceService';
import { ServiceRequest } from '@/types/supabase';
import { durationMinutesToLabel, serviceSlugToLabel } from '@/utils/serviceTypes';

export function ServiceSearchingScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [professional, setProfessional] = useState<PublicProfessionalProfile | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loadingCancel, setLoadingCancel] = useState(false);

  const accepted = request?.status === 'accepted';

  useEffect(() => {
    if (!id) return;

    let active = true;

    async function loadRequest() {
      try {
        const data = await getServiceRequestForClient(id);
        if (active) setRequest(data);
        if (active && data.accepted_professional_id) {
          const publicProfile = await getPublicProfessionalProfile(data.accepted_professional_id);
          setProfessional(publicProfile);
        }
      } catch (error) {
        if (active) setMessage(error instanceof Error ? error.message : 'Não foi possível acompanhar o TAKE.');
      }
    }

    loadRequest();
    const timer = setInterval(loadRequest, 5000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [id]);

  const subtitle = useMemo(() => {
    if (!request) return 'Estamos preparando sua busca.';
    return `${serviceSlugToLabel(request.service_type)} · ${durationMinutesToLabel(request.duration_minutes)}`;
  }, [request]);

  async function handleCancel() {
    if (!id) return;

    setLoadingCancel(true);
    setMessage(null);
    try {
      await cancelServiceRequest(id);
      router.replace('/client/index' as never);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Não foi possível cancelar este TAKE.');
    } finally {
      setLoadingCancel(false);
    }
  }

  return (
    <Screen scroll={false}>
      <View style={styles.wrapper}>
        <View style={styles.pulse}>
          <View style={styles.pulseInner}>
            <Text style={styles.pulseText}>TAKE</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.eyebrow}>{accepted ? 'TAKE confirmado' : 'Procurando profissionais...'}</Text>
          <Text style={styles.title}>{accepted ? 'Seu TAKE foi aceito!' : 'Buscando alguém por perto'}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
          {request?.neighborhood || request?.city ? (
            <Text style={styles.location}>{[request.neighborhood, request.city].filter(Boolean).join(', ')}</Text>
          ) : null}
          {accepted ? <MessageBox tone="success" message="Profissional confirmado. Os detalhes aparecem em seus pedidos." /> : null}
          {accepted && professional ? (
            <View style={styles.professionalBox}>
              <Text style={styles.professionalName}>{professional.display_name ?? 'Profissional TAKE'}</Text>
              <Text style={styles.professionalMeta}>
                ⭐ {Number(professional.rating).toFixed(1).replace('.', ',')} ·{' '}
                {professional.is_verified ? 'Verificado' : 'Perfil TAKE'}
              </Text>
              <Text style={styles.location}>{[professional.neighborhood, professional.city].filter(Boolean).join(', ')}</Text>
            </View>
          ) : null}
          {message ? <MessageBox tone="error" message={message} /> : null}
        </View>

        <View style={styles.actions}>
          {accepted ? (
            <Button title="Voltar ao início" onPress={() => router.replace('/client/index' as never)} />
          ) : (
            <Button
              title={loadingCancel ? 'Cancelando...' : 'Cancelar busca'}
              variant="secondary"
              onPress={handleCancel}
            />
          )}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'space-between',
    gap: spacing.xl,
  },
  pulse: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  pulseInner: {
    width: 132,
    height: 132,
    borderRadius: 66,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 14,
    borderColor: '#FFE3AE',
  },
  pulseText: {
    color: colors.graphite,
    fontSize: typography.size.lg,
    fontWeight: '900',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    gap: spacing.md,
    ...shadows.card,
  },
  eyebrow: {
    color: colors.primaryDark,
    fontSize: typography.size.sm,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontSize: typography.size.xxl,
    fontWeight: '900',
    lineHeight: 39,
  },
  subtitle: {
    color: colors.text,
    fontSize: typography.size.lg,
    fontWeight: '800',
  },
  location: {
    color: colors.textMuted,
    fontSize: typography.size.md,
    lineHeight: 22,
  },
  actions: {
    gap: spacing.md,
  },
  professionalBox: {
    backgroundColor: colors.surfaceWarm,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  professionalName: {
    color: colors.text,
    fontSize: typography.size.lg,
    fontWeight: '900',
  },
  professionalMeta: {
    color: colors.primaryDark,
    fontSize: typography.size.sm,
    fontWeight: '900',
  },
});
