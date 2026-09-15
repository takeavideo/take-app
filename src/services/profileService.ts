import { supabase } from '@/lib/supabase';
import {
  PortfolioMediaType,
  Profile,
  ServiceTypeSlug,
  UserType,
} from '@/types/supabase';

export type ClientOnboardingInput = {
  userId: string;
  name: string;
  email: string;
  phone: string;
  city: string;
};

export type ProfessionalOnboardingInput = {
  userId: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  neighborhood: string;
  specialties: ServiceTypeSlug[];
  bio: string;
  equipment: { name: string; category: string }[];
  portfolio: { mediaUrl: string; mediaType: PortfolioMediaType; description?: string }[];
};

export async function getCurrentProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle<Profile>();

  if (error) throw error;
  return data;
}

export async function upsertProfile(input: {
  userId: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  userType: UserType;
}) {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      user_id: input.userId,
      name: input.name,
      email: input.email,
      phone: input.phone ?? null,
      city: input.city ?? null,
      user_type: input.userType,
    })
    .select()
    .single<Profile>();

  if (error) throw error;
  return data;
}

export async function completeClientOnboarding(input: ClientOnboardingInput) {
  return upsertProfile({
    userId: input.userId,
    name: input.name,
    email: input.email,
    phone: input.phone,
    city: input.city,
    userType: 'client',
  });
}

export async function completeProfessionalOnboarding(input: ProfessionalOnboardingInput) {
  await upsertProfile({
    userId: input.userId,
    name: input.name,
    email: input.email,
    phone: input.phone,
    city: input.city,
    userType: 'professional',
  });

  const { data: professionalProfile, error: professionalError } = await supabase
    .from('professional_profiles')
    .upsert({
      user_id: input.userId,
      bio: input.bio,
      city: input.city,
      neighborhood: input.neighborhood,
      is_available: false,
      is_verified: false,
    })
    .select()
    .single<{ id: string }>();

  if (professionalError) throw professionalError;

  if (input.specialties.length > 0) {
    const { error } = await supabase.from('professional_services').upsert(
      input.specialties.map((serviceType) => ({
        professional_id: professionalProfile.id,
        service_type: serviceType,
        price_from: null,
      })),
    );
    if (error) throw error;
  }

  if (input.equipment.length > 0) {
    const { error } = await supabase.from('professional_equipment').insert(
      input.equipment.map((item) => ({
        professional_id: professionalProfile.id,
        name: item.name,
        category: item.category,
      })),
    );
    if (error) throw error;
  }

  if (input.portfolio.length > 0) {
    const { error } = await supabase.from('portfolio_items').insert(
      input.portfolio.map((item) => ({
        professional_id: professionalProfile.id,
        media_url: item.mediaUrl,
        media_type: item.mediaType,
        description: item.description ?? null,
      })),
    );
    if (error) throw error;
  }

  return professionalProfile;
}
