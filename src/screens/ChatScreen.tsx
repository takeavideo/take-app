import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/Button';
import { MessageBox } from '@/components/MessageBox';
import { Screen } from '@/components/Screen';
import { colors, radius, shadows, spacing, typography } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import {
  getAcceptedServiceRequest,
  getServiceRequestForClient,
  getServiceRequestMessages,
  markServiceRequestMessagesRead,
  sendServiceRequestMessage,
} from '@/services/marketplaceService';
import { useAuth } from '@/providers/AuthProvider';
import { ServiceRequestMessage, ServiceRequestStatus } from '@/types/supabase';
import { contactGuardMessage, containsExternalContact } from '@/utils/contactGuard';
import { serviceSlugToLabel } from '@/utils/serviceTypes';

export function ChatScreen() {
  const router = useRouter();
  const { id, peerName } = useLocalSearchParams<{ id: string; peerName?: string }>();
  const { profile } = useAuth();
  const [messages, setMessages] = useState<ServiceRequestMessage[]>([]);
  const [status, setStatus] = useState<ServiceRequestStatus | null>(null);
  const [serviceLabel, setServiceLabel] = useState('TAKE');
  const [text, setText] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const userType = profile?.user_type;

  const otherPartyName = useMemo(() => {
    if (peerName) return String(peerName);
    return userType === 'professional' ? 'Cliente TAKE' : 'Profissional TAKE';
  }, [peerName, userType]);

  const loadChat = useCallback(async () => {
    if (!id) return;

    try {
      const nextMessages = await getServiceRequestMessages(id);
      setMessages(nextMessages);
      await markServiceRequestMessagesRead(id);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Não foi possível carregar o chat.');
    }
  }, [id]);

  const loadStatus = useCallback(async () => {
    if (!id) return;

    try {
      if (userType === 'professional') {
        const accepted = await getAcceptedServiceRequest(id);
        if (accepted) {
          setStatus(accepted.status);
          setServiceLabel(serviceSlugToLabel(accepted.service_type));
        }
        return;
      }

      const request = await getServiceRequestForClient(id);
      setStatus(request.status);
      setServiceLabel(serviceSlugToLabel(request.service_type));
    } catch {
      setStatus(null);
    }
  }, [id, userType]);

  useEffect(() => {
    void Promise.resolve().then(async () => {
      await loadStatus();
      await loadChat();
    });
  }, [loadChat, loadStatus]);

  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel(`take-chat-${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'service_request_messages',
          filter: `service_request_id=eq.${id}`,
        },
        () => {
          void Promise.resolve().then(loadChat);
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'service_requests',
          filter: `id=eq.${id}`,
        },
        () => {
          void Promise.resolve().then(loadStatus);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [id, loadChat, loadStatus]);

  async function handleSend() {
    if (!id || loading) return;

    const nextText = text.trim();
    if (!nextText) return;

    setNotice(null);
    if (containsExternalContact(nextText)) {
      setNotice(contactGuardMessage);
      return;
    }

    setLoading(true);
    try {
      await sendServiceRequestMessage(id, nextText);
      setText('');
      await loadChat();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Não foi possível enviar a mensagem.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen scroll={false}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.wrapper}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>
          <View style={styles.headerText}>
            <Text style={styles.name}>{otherPartyName}</Text>
            <Text style={styles.status}>{serviceLabel} · {status ? statusLabel(status) : 'Carregando'}</Text>
          </View>
        </View>

        <MessageBox message="Para sua segurança, mantenha toda a comunicação e contratação dentro do TAKE." tone="info" />
        {notice ? <MessageBox message={notice} tone="error" /> : null}

        <ScrollView contentContainerStyle={styles.messages} showsVerticalScrollIndicator={false}>
          {messages.length === 0 ? <Text style={styles.empty}>Nenhuma mensagem ainda.</Text> : null}
          {messages.map((message) => {
            const mine = message.sender_role === userType;
            return (
              <View key={message.id} style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleOther]}>
                <Text style={styles.bubbleRole}>{mine ? 'Você' : otherPartyName}</Text>
                <Text style={styles.bubbleText}>{message.message}</Text>
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.composer}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Digite uma mensagem..."
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            multiline
          />
          <Button title={loading ? 'Enviando...' : 'Enviar'} onPress={handleSend} style={styles.sendButton} />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function statusLabel(status: ServiceRequestStatus) {
  const labels: Record<ServiceRequestStatus, string> = {
    searching: 'Procurando',
    accepted: 'Confirmado',
    in_progress: 'Em andamento',
    completed: 'Concluído',
    cancelled: 'Cancelado',
  };

  return labels[status];
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '800',
    marginTop: -2,
  },
  headerText: {
    flex: 1,
  },
  name: {
    color: colors.text,
    fontSize: typography.size.xl,
    fontWeight: '900',
  },
  status: {
    color: colors.textMuted,
    fontSize: typography.size.sm,
    fontWeight: '700',
    marginTop: spacing.xs / 2,
  },
  messages: {
    flexGrow: 1,
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  empty: {
    color: colors.textMuted,
    fontSize: typography.size.md,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.xs,
    ...shadows.card,
  },
  bubbleMine: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
  },
  bubbleOther: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bubbleRole: {
    color: colors.graphite,
    fontSize: typography.size.xs,
    fontWeight: '900',
  },
  bubbleText: {
    color: colors.text,
    fontSize: typography.size.md,
    lineHeight: 22,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    minHeight: 52,
    maxHeight: 118,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    fontSize: typography.size.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  sendButton: {
    minHeight: 52,
    paddingHorizontal: spacing.lg,
  },
});
