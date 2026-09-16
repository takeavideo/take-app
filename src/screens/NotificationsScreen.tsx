import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { MessageBox } from '@/components/MessageBox';
import { Screen } from '@/components/Screen';
import { colors, radius, shadows, spacing, typography } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import { listAppNotifications, markAppNotificationRead } from '@/services/notificationService';
import { AppNotification, NotificationType } from '@/types/supabase';

export function NotificationsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const unread = useMemo(() => notifications.filter((item) => !item.read_at).length, [notifications]);

  const loadNotifications = useCallback(async () => {
    try {
      const data = await listAppNotifications();
      setNotifications(data);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Não foi possível carregar notificações.');
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(loadNotifications);
  }, [loadNotifications]);

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`take-notifications-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'app_notifications',
          filter: `recipient_user_id=eq.${user.id}`,
        },
        () => {
          void Promise.resolve().then(loadNotifications);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [loadNotifications, user?.id]);

  async function handleRead(notification: AppNotification) {
    try {
      await markAppNotificationRead(notification.id);
      await loadNotifications();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Não foi possível marcar como lida.');
    }
  }

  function handleOpen(notification: AppNotification) {
    const requestId = notification.service_request_id;
    if (!requestId) return;

    if (notification.type === 'chat_message') {
      router.push(`/chat/${requestId}` as never);
      return;
    }

    if (notification.type === 'take_accepted' || notification.type === 'take_in_progress' || notification.type === 'take_completed') {
      router.push(`/service-searching/${requestId}` as never);
    }
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Notificações</Text>
        <Text style={styles.counter}>{unread} não lidas</Text>
      </View>

      {message ? <MessageBox message={message} tone="error" /> : null}

      <Button title="Atualizar" variant="secondary" onPress={loadNotifications} />

      <View style={styles.list}>
        {notifications.length === 0 ? <Text style={styles.empty}>Nenhuma notificação ainda.</Text> : null}
        {notifications.map((notification) => (
          <Pressable key={notification.id} style={[styles.card, !notification.read_at && styles.unreadCard]} onPress={() => handleOpen(notification)}>
            <View style={styles.cardHeader}>
              <Text style={styles.eyebrow}>{notificationLabel(notification.type)}</Text>
              {!notification.read_at ? <Text style={styles.badge}>Nova</Text> : null}
            </View>
            <Text style={styles.cardTitle}>{notification.title}</Text>
            <Text style={styles.body}>{notification.body}</Text>
            {!notification.read_at ? (
              <Button title="Marcar como lida" variant="secondary" onPress={() => handleRead(notification)} style={styles.readButton} />
            ) : null}
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

function notificationLabel(type: NotificationType) {
  const labels: Record<NotificationType, string> = {
    new_take_nearby: 'Novo TAKE perto de você',
    take_accepted: 'Seu TAKE foi aceito',
    take_in_progress: 'Seu TAKE começou',
    take_completed: 'Seu TAKE foi concluído',
    chat_message: 'Nova mensagem no TAKE',
  };

  return labels[type];
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.xs,
  },
  title: {
    color: colors.text,
    fontSize: typography.size.xxl,
    fontWeight: '900',
  },
  counter: {
    color: colors.textMuted,
    fontSize: typography.size.md,
    fontWeight: '700',
  },
  list: {
    gap: spacing.md,
  },
  empty: {
    color: colors.textMuted,
    fontSize: typography.size.md,
    lineHeight: 22,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
    ...shadows.card,
  },
  unreadCard: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceWarm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  eyebrow: {
    color: colors.primaryDark,
    fontSize: typography.size.xs,
    fontWeight: '900',
    textTransform: 'uppercase',
    flex: 1,
  },
  badge: {
    color: colors.graphite,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    fontSize: typography.size.xs,
    fontWeight: '900',
    overflow: 'hidden',
  },
  cardTitle: {
    color: colors.text,
    fontSize: typography.size.lg,
    fontWeight: '900',
  },
  body: {
    color: colors.textMuted,
    fontSize: typography.size.md,
    lineHeight: 22,
  },
  readButton: {
    minHeight: 42,
    marginTop: spacing.xs,
  },
});
