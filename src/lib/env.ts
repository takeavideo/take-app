export const env = {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  supabasePublishableKey:
    process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
    '',
};

export const isSupabaseConfigured =
  env.supabaseUrl.startsWith('https://') && env.supabasePublishableKey.length > 20;
