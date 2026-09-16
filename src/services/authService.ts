import { supabase } from '@/lib/supabase';
import { revokePushToken } from '@/services/notificationService';
import { getCurrentProfile, upsertProfile } from '@/services/profileService';
import { UserType } from '@/types/supabase';

export type SignUpInput = {
  email: string;
  password: string;
  name: string;
  phone?: string;
  userType: UserType;
};

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUpWithEmail(input: SignUpInput) {
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

  if (error) throw error;
  if (!data.user) throw new Error('Não foi possível criar o usuário.');

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
  return data;
}

export async function sendPasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
}

export async function signOut() {
  try {
    await revokePushToken();
  } catch {
    // Logout should continue even if the device cannot revoke a local push token.
  }

  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
