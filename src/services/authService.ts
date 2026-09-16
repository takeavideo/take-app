import AsyncStorage from '@react-native-async-storage/async-storage';

import { supabase } from '@/lib/supabase';
import { revokePushToken } from '@/services/notificationService';
import { getCurrentProfile, upsertProfile } from '@/services/profileService';
import { Profile, UserType } from '@/types/supabase';

export type SignUpInput = {
  email: string;
  password: string;
  name: string;
  phone?: string;
  userType: UserType;
};

export type SignUpResult = {
  needsEmailConfirmation: boolean;
  userType: UserType;
};

export type SignInResult = {
  session: unknown;
  user: AuthUserForProfile;
  profile: Profile;
  profileCreated: boolean;
};

type PendingSignUpProfile = {
  email: string;
  name: string;
  phone?: string;
  userType: UserType;
  createdAt: string;
};

type AuthUserForProfile = {
  id: string;
  email?: string;
  user_metadata?: {
    name?: string;
    phone?: string | null;
    user_type?: UserType;
  };
};

const PENDING_SIGNUP_STORAGE_KEY = 'take.pendingSignUpProfile';

function logSupabaseAuthError(context: string, error: unknown) {
  if (!error || typeof error !== 'object') {
    console.error(`[TAKE auth] ${context}`, error);
    return;
  }

  const detail = error as {
    name?: string;
    message?: string;
    status?: number;
    code?: string;
  };

  console.error(`[TAKE auth] ${context}`, {
    name: detail.name,
    message: detail.message,
    status: detail.status,
    code: detail.code,
  });
}

function toFriendlyAuthError(error: unknown, fallbackMessage: string) {
  if (!error || typeof error !== 'object') {
    return new Error(fallbackMessage);
  }

  const detail = error as {
    message?: string;
    code?: string;
    status?: number;
  };
  const rawMessage = detail.message ?? '';
  const normalizedMessage = rawMessage.toLowerCase();
  const normalizedCode = detail.code?.toLowerCase() ?? '';

  if (
    normalizedCode.includes('user_already_exists') ||
    normalizedMessage.includes('already registered') ||
    normalizedMessage.includes('already exists') ||
    normalizedMessage.includes('user already registered')
  ) {
    return new Error('Este e-mail já está cadastrado. Entre na sua conta ou recupere sua senha.');
  }

  if (
    normalizedCode.includes('weak_password') ||
    normalizedCode.includes('invalid_password') ||
    normalizedMessage.includes('password')
  ) {
    return new Error('Use uma senha válida com pelo menos 6 caracteres.');
  }

  if (normalizedMessage.includes('invalid login credentials')) {
    return new Error('E-mail ou senha inválidos.');
  }

  if (normalizedMessage.includes('email not confirmed')) {
    return new Error('Confirme seu e-mail antes de entrar no TAKE.');
  }

  if (normalizedCode.includes('over_email_send_rate_limit') || normalizedMessage.includes('email rate limit')) {
    return new Error('Limite de envio de e-mails atingido. Aguarde alguns minutos e tente novamente.');
  }

  return new Error(rawMessage || fallbackMessage);
}

export async function signInWithEmail(email: string, password: string): Promise<SignInResult> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    logSupabaseAuthError('signInWithPassword failed', error);
    throw toFriendlyAuthError(error, 'Não foi possível entrar.');
  }

  if (!data.user) {
    throw new Error('Não foi possível recuperar os dados da conta.');
  }

  const { profile, created } = await ensureProfileForAuthenticatedUser(data.user);

  return {
    session: data.session,
    user: data.user,
    profile,
    profileCreated: created,
  };
}

export async function signUpWithEmail(input: SignUpInput): Promise<SignUpResult> {
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        name: input.name,
        phone: input.phone ?? null,
        user_type: input.userType,
      },
    },
  });

  if (error) {
    logSupabaseAuthError('signUp failed', error);
    throw toFriendlyAuthError(error, 'Não foi possível criar sua conta.');
  }
  if (!data.user) throw new Error('Não foi possível criar o usuário.');

  if (!data.session) {
    await savePendingSignUpProfile(input);
    return {
      needsEmailConfirmation: true,
      userType: input.userType,
    };
  }

  const existingProfile = await getCurrentProfile(data.user.id);
  if (!existingProfile) {
    await upsertProfile({
      userId: data.user.id,
      name: input.name,
      email: input.email,
      phone: input.phone ?? undefined,
      userType: input.userType,
    });
  }
  if (existingProfile) {
    await upsertProfile({
      userId: data.user.id,
      name: input.name,
      email: existingProfile.email,
      phone: input.phone ?? undefined,
      city: existingProfile.city ?? undefined,
      userType: existingProfile.user_type,
    });
  }

  await clearPendingSignUpProfile(input.email);

  return {
    needsEmailConfirmation: false,
    userType: input.userType,
  };
}

export async function sendPasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) {
    logSupabaseAuthError('resetPasswordForEmail failed', error);
    throw toFriendlyAuthError(error, 'Não foi possível enviar a recuperação de senha.');
  }
}

export async function signOut() {
  try {
    await revokePushToken();
  } catch {
    // Logout should continue even if the device cannot revoke a local push token.
  }

  const { error } = await supabase.auth.signOut();
  if (error) {
    logSupabaseAuthError('signOut failed', error);
    throw toFriendlyAuthError(error, 'Não foi possível sair da conta.');
  }
}

async function ensureProfileForAuthenticatedUser(user: AuthUserForProfile) {
  const existingProfile = await getCurrentProfile(user.id);
  if (existingProfile) return { profile: existingProfile, created: false };

  const pendingProfile = await loadPendingSignUpProfile(user.email);
  const metadataUserType = user.user_metadata?.user_type === 'professional' ? 'professional' : 'client';
  const userType = pendingProfile?.userType ?? metadataUserType;
  const name = pendingProfile?.name || user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário TAKE';

  if (!user.email) {
    throw new Error('Não foi possível recuperar o e-mail da conta.');
  }

  const profile = await upsertProfile({
    userId: user.id,
    name,
    email: user.email,
    phone: pendingProfile?.phone ?? user.user_metadata?.phone ?? undefined,
    userType,
  });

  await clearPendingSignUpProfile(user.email);

  return { profile, created: true };
}

async function savePendingSignUpProfile(input: SignUpInput) {
  const pendingProfile: PendingSignUpProfile = {
    email: input.email.trim().toLowerCase(),
    name: input.name.trim(),
    phone: input.phone?.trim() || undefined,
    userType: input.userType,
    createdAt: new Date().toISOString(),
  };

  await AsyncStorage.setItem(PENDING_SIGNUP_STORAGE_KEY, JSON.stringify(pendingProfile));
}

async function loadPendingSignUpProfile(email?: string) {
  if (!email) return null;

  const storedValue = await AsyncStorage.getItem(PENDING_SIGNUP_STORAGE_KEY);
  if (!storedValue) return null;

  try {
    const pendingProfile = JSON.parse(storedValue) as PendingSignUpProfile;
    return pendingProfile.email === email.trim().toLowerCase() ? pendingProfile : null;
  } catch {
    await AsyncStorage.removeItem(PENDING_SIGNUP_STORAGE_KEY);
    return null;
  }
}

async function clearPendingSignUpProfile(email?: string) {
  if (!email) {
    await AsyncStorage.removeItem(PENDING_SIGNUP_STORAGE_KEY);
    return;
  }

  const pendingProfile = await loadPendingSignUpProfile(email);
  if (pendingProfile) {
    await AsyncStorage.removeItem(PENDING_SIGNUP_STORAGE_KEY);
  }
}
