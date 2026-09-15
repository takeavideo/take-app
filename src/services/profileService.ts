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
  const existingProfile = await getCurrentProfile(input.userId);

  if (existingProfile) {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        name: input.name,
        phone: input.phone ?? null,
        city: input.city ?? null,
      })
      .eq('user_id', input.userId)
      .select()
      .single<Profile>();

    if (error) throw error;
    return data;
  }

  const { data, error } = await supabase
    .from('profiles')
    .insert({
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

  const existingProfessional = await getProfessionalProfileForUser(input.userId);
  let professionalProfile: { id: string };

  if (existingProfessional) {
    const { data, error } = await supabase
      .from('professional_profiles')
      .update({
        display_name: input.name,
        bio: input.bio,
        city: input.city,
        neighborhood: input.neighborhood,
        is_available: false,
      })
      .eq('user_id', input.userId)
      .select('id')
      .single<{ id: string }>();

    if (error) throw error;
    professionalProfile = data;
  } else {
    const { data, error } = await supabase
      .from('professional_profiles')
      .insert({
        user_id: input.userId,
        display_name: input.name,
        bio: input.bio,
        city: input.city,
        neighborhood: input.neighborhood,
        is_available: false,
        is_verified: false,
        rating: 0,
        total_reviews: 0,
      })
      .select('id')
      .single<{ id: string }>();

    if (error) throw error;
    professionalProfile = data;
  }

  if (input.specialties.length > 0) {
    const { error } = await supabase.from('professional_services').upsert(
      input.specialties.map((serviceType) => ({
        professional_id: professionalProfile.id,
        service_type: serviceType,
        price_from: null,
      })),
      { onConflict: 'professional_id,service_type' },
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

export async function getProfessionalProfileForUser(userId: string) {
  const { data, error } = await supabase
    .from('professional_profiles')
    .select('id,user_id,bio,city,neighborhood,is_available,is_verified,rating,total_reviews')
    .eq('user_id', userId)
    .maybeSingle<{ id: string; is_available: boolean }>();

  if (error) throw error;
  return data;
}

export async function setProfessionalAvailability(input: {
  userId: string;
  isAvailable: boolean;
  latitude?: number;
  longitude?: number;
}) {
  const updatePayload: {
    is_available: boolean;
    latitude?: number;
    longitude?: number;
  } = {
    is_available: input.isAvailable,
  };

  if (typeof input.latitude === 'number' && typeof input.longitude === 'number') {
    updatePayload.latitude = input.latitude;
    updatePayload.longitude = input.longitude;
  }

  const { data, error } = await supabase
    .from('professional_profiles')
    .update(updatePayload)
    .eq('user_id', input.userId)
    .select('id,is_available')
    .single<{ id: string; is_available: boolean }>();

  if (error) throw error;
  return data;
}
