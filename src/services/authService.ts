import { supabase } from '@/lib/supabase';
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

  const { error: profileError } = await supabase.from('profiles').upsert({
    user_id: data.user.id,
    name: input.name,
    email: input.email,
    phone: input.phone ?? null,
    user_type: input.userType,
  });

  if (profileError) throw profileError;
  return data;
}

export async function sendPasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
