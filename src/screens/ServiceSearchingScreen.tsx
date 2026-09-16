import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { MessageBox } from '@/components/MessageBox';
import { Screen } from '@/components/Screen';
import { colors, radius, shadows, spacing, typography } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
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

  const confirmed = request?.status === 'accepted' || request?.status === 'in_progress' || request?.status === 'completed';

  const loadRequest = useCallback(async () => {
    if (!id) return;

    try {
      const data = await getServiceRequestForClient(id);
      setRequest(data);
      if (data.accepted_professional_id) {
        const publicProfile = await getPublicProfessionalProfile(data.accepted_professional_id);
        setProfessional(publicProfile);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Não foi possível acompanhar o TAKE.');
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;

    void Promise.resolve().then(loadRequest);

    const channel = supabase
      .channel(`take-service-request-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'service_requests',
          filter: `id=eq.${id}`,
        },
        () => {
          void Promise.resolve().then(loadRequest);
        },
      )
      .subscribe();

    const fallbackTimer = setInterval(loadRequest, 30000);

    return () => {
      clearInterval(fallbackTimer);
      void supabase.removeChannel(channel);
    };
  }, [id, loadRequest]);

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
      router.replace('/client' as never);
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
          <Text style={styles.eyebrow}>{confirmed ? 'TAKE confirmado' : 'Procurando profissionais...'}</Text>
          <Text style={styles.title}>{statusTitle(request?.status)}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
          {request?.neighborhood || request?.city ? (
            <Text style={styles.location}>{[request.neighborhood, request.city].filter(Boolean).join(', ')}</Text>
          ) : null}
          <StatusTimeline status={request?.status ?? 'searching'} />
          {confirmed ? <MessageBox tone="success" message={statusMessage(request?.status)} /> : null}
          {confirmed && professional ? (
            <View style={styles.professionalBox}>
              <Text style={styles.professionalName}>{professional.display_name ?? 'Profissional TAKE'}</Text>
              <Text style={styles.professionalMeta}>
                ⭐ {Number(professional.rating).toFixed(1).replace('.', ',')} ·{' '}
                {professional.is_verified ? 'Verificado' : 'Perfil TAKE'}
              </Text>
              <Text style={styles.location}>{[professional.neighborhood, professional.city].filter(Boolean).join(', ')}</Text>
              <Button
                title="Abrir chat"
                variant="secondary"
                onPress={() => router.push(`/chat/${id}?peerName=${encodeURIComponent(professional.display_name ?? 'Profissional TAKE')}` as never)}
              />
            </View>
          ) : null}
          {message ? <MessageBox tone="error" message={message} /> : null}
        </View>

        <View style={styles.actions}>
          {confirmed ? (
            <Button title="Voltar ao início" onPress={() => router.replace('/client' as never)} />
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

function statusTitle(status?: ServiceRequest['status']) {
  if (status === 'accepted') return 'Seu TAKE foi aceito!';
  if (status === 'in_progress') return 'Seu TAKE começou.';
  if (status === 'completed') return 'Seu TAKE foi concluído.';
  if (status === 'cancelled') return 'Busca cancelada';
  return 'Buscando alguém por perto';
}

function statusMessage(status?: ServiceRequest['status']) {
  if (status === 'in_progress') return 'O profissional iniciou o serviço.';
  if (status === 'completed') return 'O serviço foi finalizado.';
  return 'Profissional confirmado. Você já pode conversar pelo chat.';
}

function StatusTimeline({ status }: { status: ServiceRequest['status'] }) {
  const steps = [
    { key: 'searching', label: 'PROCURANDO PROFISSIONAL' },
    { key: 'accepted', label: 'PROFISSIONAL CONFIRMADO' },
    { key: 'in_progress', label: 'TAKE EM ANDAMENTO' },
    { key: 'completed', label: 'TAKE CONCLUÍDO' },
  ];
  const statusIndex = steps.findIndex((step) => step.key === status);
  const activeIndex = status === 'cancelled' ? 0 : Math.max(statusIndex, 0);

  return (
    <View style={styles.timeline}>
      {steps.map((step, index) => {
        const active = index <= activeIndex;
        return (
          <View key={step.key} style={styles.timelineRow}>
            <View style={[styles.timelineDot, active && styles.timelineDotActive]} />
            <Text style={[styles.timelineLabel, active && styles.timelineLabelActive]}>{step.label}</Text>
          </View>
        );
      })}
    </View>
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
  timeline: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.border,
  },
  timelineDotActive: {
    backgroundColor: colors.primary,
  },
  timelineLabel: {
    color: colors.textMuted,
    fontSize: typography.size.xs,
    fontWeight: '900',
  },
  timelineLabelActive: {
    color: colors.text,
  },
});
