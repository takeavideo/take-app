import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { MessageBox } from '@/components/MessageBox';
import { Screen } from '@/components/Screen';
import { StatCard } from '@/components/StatCard';
import { colors, radius, shadows, spacing, typography } from '@/constants/theme';
import { useAuth } from '@/providers/AuthProvider';
import { requestCurrentLocation } from '@/services/locationService';
import { acceptServiceRequest, getAcceptedServiceRequest, getNearbyServiceRequests } from '@/services/marketplaceService';
import { getProfessionalProfileForUser, setProfessionalAvailability } from '@/services/profileService';
import { AcceptedServiceRequest, NearbyServiceRequest } from '@/types/supabase';
import { durationMinutesToLabel, serviceSlugToLabel } from '@/utils/serviceTypes';

export function ProHomeScreen() {
  const [online, setOnline] = useState(false);
  const [requests, setRequests] = useState<NearbyServiceRequest[]>([]);
  const [acceptedTake, setAcceptedTake] = useState<AcceptedServiceRequest | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loadingOnline, setLoadingOnline] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const router = useRouter();
  const { user, profile } = useAuth();

  const loadNearbyRequests = useCallback(async () => {
    if (!online) return;

    setLoadingRequests(true);
    try {
      const nearbyRequests = await getNearbyServiceRequests(10);
      setRequests(nearbyRequests);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Não foi possível carregar TAKES próximos.');
    } finally {
      setLoadingRequests(false);
    }
  }, [online]);

  const loadAvailability = useCallback(async () => {
    if (!user) return;

    try {
      const professionalProfile = await getProfessionalProfileForUser(user.id);
      setOnline(Boolean(professionalProfile?.is_available));
    } catch {
      setOnline(false);
    }
  }, [user]);

  useEffect(() => {
    void Promise.resolve().then(loadAvailability);
  }, [loadAvailability]);

  useEffect(() => {
    if (!online) return;
    void Promise.resolve().then(loadNearbyRequests);
  }, [loadNearbyRequests, online]);

  async function handleGoOnline() {
    if (!user) {
      router.replace('/auth/sign-in' as never);
      return;
    }

    setLoadingOnline(true);
    setMessage(null);
    try {
      const location = await requestCurrentLocation();
      await setProfessionalAvailability({
        userId: user.id,
        isAvailable: true,
        latitude: location.latitude,
        longitude: location.longitude,
      });
      setOnline(true);
      setMessage('Você está disponível para receber TAKES.');
      await loadNearbyRequests();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Não foi possível ficar online.');
    } finally {
      setLoadingOnline(false);
    }
  }

  async function handleGoOffline() {
    if (!user) return;

    setLoadingOnline(true);
    setMessage(null);
    try {
      await setProfessionalAvailability({ userId: user.id, isAvailable: false });
      setOnline(false);
      setRequests([]);
      setMessage('Você está offline.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Não foi possível ficar offline.');
    } finally {
      setLoadingOnline(false);
    }
  }

  async function handleAccept(requestId: string) {
    setMessage(null);
    try {
      const [accepted] = await acceptServiceRequest(requestId);
      if (!accepted) {
        setMessage('Este TAKE já foi aceito por outro profissional.');
        await loadNearbyRequests();
        return;
      }
      const acceptedDetails = await getAcceptedServiceRequest(requestId);
      setAcceptedTake(acceptedDetails ?? accepted);
      setRequests((current) => current.filter((request) => request.request_id !== requestId));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Não foi possível aceitar este TAKE.');
    }
  }

  return (
    <Screen>
      <View>
        <Text style={styles.hello}>Olá, {profile?.name ?? 'profissional'}.</Text>
        <Text style={styles.subtitle}>Controle sua disponibilidade para novos TAKES.</Text>
      </View>

      {message ? <MessageBox message={message} tone={online ? 'success' : 'info'} /> : null}

      <View style={[styles.onlineCard, online && styles.onlineCardActive]}>
        <Text style={styles.onlineStatus}>{online ? 'ONLINE' : 'OFFLINE'}</Text>
        <Text style={styles.onlineTitle}>{online ? 'Você está disponível para receber solicitações.' : 'FICAR ONLINE'}</Text>
        <Button
          title={loadingOnline ? 'Atualizando...' : online ? 'FICAR OFFLINE' : 'FICAR ONLINE'}
          variant={online ? 'secondary' : 'primary'}
          onPress={online ? handleGoOffline : handleGoOnline}
        />
      </View>

      {online ? (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Solicitações próximas</Text>
            <Button title={loadingRequests ? 'Buscando...' : 'Atualizar'} variant="secondary" onPress={loadNearbyRequests} style={styles.smallButton} />
          </View>
          {acceptedTake ? <AcceptedTakeCard take={acceptedTake} /> : null}
          {requests.length === 0 && !acceptedTake ? (
            <Text style={styles.emptyText}>Nenhum TAKE compatível por perto agora.</Text>
          ) : null}
          {requests.map((request) => (
            <TakeRequestCard key={request.request_id} request={request} onAccept={() => handleAccept(request.request_id)} />
          ))}
        </View>
      ) : null}

      <View style={styles.stats}>
        <StatCard value="R$ 1.480" label="Ganhos no mês" />
        <StatCard value="18" label="Trabalhos" />
        <StatCard value="4.9" label="Avaliação" />
      </View>
    </Screen>
  );
}

type TakeRequestCardProps = {
  request: NearbyServiceRequest;
  onAccept: () => void;
};

function TakeRequestCard({ request, onAccept }: TakeRequestCardProps) {
  return (
    <View style={styles.requestCard}>
      <Text style={styles.requestEyebrow}>NOVO TAKE</Text>
      <Text style={styles.requestTitle}>{serviceSlugToLabel(request.service_type)}</Text>
      <Text style={styles.requestMeta}>
        {durationMinutesToLabel(request.duration_minutes)} · {Number(request.distance_km).toFixed(1).replace('.', ',')} km
      </Text>
      <Text style={styles.requestLocation}>{[request.neighborhood, request.city].filter(Boolean).join(', ')}</Text>
      {request.description ? <Text style={styles.requestDescription}>{request.description}</Text> : null}
      <View style={styles.valueBox}>
        <Text style={styles.valueLabel}>Valor estimado</Text>
        <Text style={styles.valueText}>R$ {Number(request.estimated_price ?? 0).toFixed(0)}</Text>
      </View>
      <View style={styles.requestActions}>
        <Button title="RECUSAR" variant="danger" onPress={() => undefined} style={styles.actionButton} />
        <Button title="ACEITAR TAKE" onPress={onAccept} style={styles.actionButton} />
      </View>
    </View>
  );
}

type AcceptedTakeCardProps = {
  take: AcceptedServiceRequest;
};

function AcceptedTakeCard({ take }: AcceptedTakeCardProps) {
  return (
    <View style={styles.acceptedCard}>
      <Text style={styles.requestEyebrow}>TAKE confirmado</Text>
      <Text style={styles.requestTitle}>{serviceSlugToLabel(take.service_type)}</Text>
      <Text style={styles.requestMeta}>{durationMinutesToLabel(take.duration_minutes)}</Text>
      <Text style={styles.requestLocation}>{[take.neighborhood, take.city].filter(Boolean).join(', ')}</Text>
      {take.description ? <Text style={styles.requestDescription}>{take.description}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  hello: {
    color: colors.text,
    fontSize: typography.size.xxl,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: typography.size.md,
    marginTop: spacing.xs,
  },
  onlineCard: {
    backgroundColor: colors.graphite,
    borderRadius: radius.xl,
    padding: spacing.xl,
    gap: spacing.lg,
    ...shadows.card,
  },
  onlineCardActive: {
    backgroundColor: '#12382C',
  },
  onlineStatus: {
    color: colors.primary,
    fontSize: typography.size.sm,
    fontWeight: '900',
  },
  onlineTitle: {
    color: colors.surface,
    fontSize: typography.size.xl,
    fontWeight: '900',
    lineHeight: 32,
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  section: {
    gap: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: typography.size.lg,
    fontWeight: '900',
  },
  smallButton: {
    minHeight: 40,
    paddingHorizontal: spacing.md,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: typography.size.md,
    lineHeight: 22,
  },
  requestCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
    ...shadows.card,
  },
  acceptedCard: {
    backgroundColor: colors.surfaceWarm,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#F2D4A2',
    gap: spacing.sm,
  },
  requestEyebrow: {
    color: colors.primaryDark,
    fontSize: typography.size.sm,
    fontWeight: '900',
  },
  requestTitle: {
    color: colors.text,
    fontSize: typography.size.xl,
    fontWeight: '900',
  },
  requestMeta: {
    color: colors.text,
    fontSize: typography.size.md,
    fontWeight: '800',
  },
  requestLocation: {
    color: colors.textMuted,
    fontSize: typography.size.sm,
    lineHeight: 20,
  },
  requestDescription: {
    color: colors.text,
    fontSize: typography.size.md,
    lineHeight: 22,
  },
  valueBox: {
    backgroundColor: colors.surfaceWarm,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  valueLabel: {
    color: colors.primaryDark,
    fontSize: typography.size.xs,
    fontWeight: '900',
  },
  valueText: {
    color: colors.text,
    fontSize: typography.size.lg,
    fontWeight: '900',
  },
  requestActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
});
