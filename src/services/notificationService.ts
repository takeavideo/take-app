import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

import { supabase } from '@/lib/supabase';
import { AppNotification } from '@/types/supabase';

const PUSH_TOKEN_STORAGE_KEY = 'take.expoPushToken';

type ExpoNotificationsModule = {
  getPermissionsAsync: () => Promise<{ status: string }>;
  requestPermissionsAsync: () => Promise<{ status: string }>;
  getExpoPushTokenAsync: (options?: { projectId?: string }) => Promise<{ data: string }>;
  setNotificationHandler?: (handler: unknown) => void;
  setNotificationChannelAsync?: (
    channelId: string,
    channel: {
      name: string;
      importance?: number;
      vibrationPattern?: number[];
      lightColor?: string;
    },
  ) => Promise<unknown>;
  AndroidImportance?: {
    DEFAULT?: number;
    HIGH?: number;
  };
};

async function loadExpoNotifications() {
  try {
    const importer = Function('return import("expo-notifications")') as () => Promise<ExpoNotificationsModule>;
    return await importer();
  } catch {
    return null;
  }
}

export async function listAppNotifications() {
  const { data, error } = await supabase
    .from('app_notifications')
    .select('id,recipient_user_id,service_request_id,type,title,body,data,delivered_at,read_at,created_at')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return (data ?? []) as AppNotification[];
}

export async function markAppNotificationRead(notificationId: string) {
  const { data, error } = await supabase.rpc('mark_app_notification_read', {
    p_notification_id: notificationId,
  });

  if (error) throw error;
  return Boolean(data);
}

export async function registerPushToken(token: string) {
  const { data, error } = await supabase.rpc('register_push_token', {
    p_token: token,
    p_platform: pushPlatform(),
    p_device_id: Constants.sessionId ?? null,
  });

  if (error) throw error;
  await AsyncStorage.setItem(PUSH_TOKEN_STORAGE_KEY, token);
  return data;
}

function pushPlatform() {
  if (Platform.OS === 'ios' || Platform.OS === 'android' || Platform.OS === 'web') {
    return Platform.OS;
  }

  return 'unknown';
}

export async function revokePushToken(token?: string | null) {
  const storedToken = token ?? (await AsyncStorage.getItem(PUSH_TOKEN_STORAGE_KEY));
  if (!storedToken) return false;

  const { data, error } = await supabase.rpc('revoke_push_token', {
    p_token: storedToken,
  });

  if (error) throw error;
  await AsyncStorage.removeItem(PUSH_TOKEN_STORAGE_KEY);
  return Boolean(data);
}

export async function registerDeviceForPushNotifications() {
  if (Platform.OS === 'web' || !Device.isDevice) {
    return { ok: false, reason: 'Push token disponível apenas em dispositivo físico compatível.' };
  }

  const Notifications = await loadExpoNotifications();
  if (!Notifications) {
    return { ok: false, reason: 'Expo Notifications não está disponível neste runtime.' };
  }

  configureForegroundNotifications(Notifications);
  await configureAndroidNotificationChannel(Notifications);

  const currentPermission = await Notifications.getPermissionsAsync();
  const permission =
    currentPermission.status === 'granted'
      ? currentPermission
      : await Notifications.requestPermissionsAsync();

  if (permission.status !== 'granted') {
    return { ok: false, reason: 'Permissão de notificações não concedida.' };
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId ??
    undefined;

  if (!projectId) {
    return {
      ok: false,
      reason: 'Configure um EAS projectId para gerar Expo Push Token em Development Build.',
    };
  }

  const token = await Notifications.getExpoPushTokenAsync({ projectId });
  await registerPushToken(token.data);

  return { ok: true, token: token.data };
}

function configureForegroundNotifications(Notifications: ExpoNotificationsModule) {
  Notifications.setNotificationHandler?.({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

async function configureAndroidNotificationChannel(Notifications: ExpoNotificationsModule) {
  if (Platform.OS !== 'android' || !Notifications.setNotificationChannelAsync) return;

  await Notifications.setNotificationChannelAsync('take-alerts', {
    name: 'TAKE',
    importance: Notifications.AndroidImportance?.HIGH ?? Notifications.AndroidImportance?.DEFAULT,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#F5A623',
  });
}
