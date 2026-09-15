import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

import { env, isSupabaseConfigured } from '@/lib/env';

const fallbackUrl = 'https://placeholder.supabase.co';
const fallbackKey =
  'placeholder-anon-key-for-local-ui-preview-only-please-set-env-values';

const ssrSafeStorage = {
  getItem: (key: string) => {
    if (Platform.OS === 'web' && typeof window === 'undefined') {
      return Promise.resolve(null);
    }

    return AsyncStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    if (Platform.OS === 'web' && typeof window === 'undefined') {
      return Promise.resolve();
    }

    return AsyncStorage.setItem(key, value);
  },
  removeItem: (key: string) => {
    if (Platform.OS === 'web' && typeof window === 'undefined') {
      return Promise.resolve();
    }

    return AsyncStorage.removeItem(key);
  },
};

export const supabase = createClient(
  isSupabaseConfigured ? env.supabaseUrl : fallbackUrl,
  isSupabaseConfigured ? env.supabasePublishableKey : fallbackKey,
  {
    auth: {
      storage: ssrSafeStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);
