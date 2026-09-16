import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { ProfessionalCard } from '@/components/ProfessionalCard';
import { Screen } from '@/components/Screen';
import { SectionHeader } from '@/components/SectionHeader';
import { ServiceCard } from '@/components/ServiceCard';
import { BrandLogo } from '@/components/BrandLogo';
import { MessageBox } from '@/components/MessageBox';
import { colors, radius, spacing, typography } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { requestCurrentLocation } from '@/services/locationService';
import { listAppNotifications } from '@/services/notificationService';
import { getAvailableProfessionals, getProfessionals, getServices } from '@/services/takeService';
import { Professional } from '@/types/domain';

export function ClientHomeScreen() {
  const router = useRouter();
  const [professionals, setProfessionals] = useState<Professional[]>(getProfessionals());
  const [locationMessage, setLocationMessage] = useState<string | null>('Toque para usar sua localização e encontrar TAKES próximos.');
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const { user } = useAuth();
  const services = getServices();

  useEffect(() => {
    loadNearbyProfessionals();
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    async function loadUnread() {
      try {
        const notifications = await listAppNotifications();
        setUnreadNotifications(notifications.filter((notification) => !notification.read_at).length);
      } catch {
        setUnreadNotifications(0);
      }
    }

    void Promise.resolve().then(loadUnread);

    const channel = supabase
      .channel(`client-notifications-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'app_notifications',
          filter: `recipient_user_id=eq.${user.id}`,
        },
        () => {
          void Promise.resolve().then(loadUnread);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user?.id]);

  async function loadNearbyProfessionals() {
    setLoadingLocation(true);
    try {
      const location = await requestCurrentLocation();
      const nearbyProfessionals = await getAvailableProfessionals({ location });
      setProfessionals(nearbyProfessionals);
      setLocationMessage('Mostrando profissionais próximos à sua localização atual.');
    } catch (error) {
      setProfessionals(getProfessionals());
      setLocationMessage(error instanceof Error ? error.message : 'Não foi possível obter sua localização.');
    } finally {
      setLoadingLocation(false);
    }
  }

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

      <Button
        title={unreadNotifications > 0 ? `Notificações (${unreadNotifications})` : 'Notificações'}
        variant="secondary"
        onPress={() => router.push('/notifications' as never)}
      />

      {locationMessage ? <MessageBox message={locationMessage} tone="info" /> : null}
      <Button
        title={loadingLocation ? 'Atualizando localização...' : 'Atualizar localização'}
        variant="secondary"
        onPress={loadNearbyProfessionals}
      />

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
