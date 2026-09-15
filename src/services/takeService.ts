import { incomingTake, professionals, services } from '@/data/mockData';
import { isSupabaseConfigured } from '@/lib/env';
import { supabase } from '@/lib/supabase';
import { Professional } from '@/types/domain';

export function getServices() {
  return services;
}

export function getProfessionals() {
  return professionals;
}

export async function getAvailableProfessionals() {
  if (!isSupabaseConfigured) {
    return professionals;
  }

  const { data, error } = await supabase
    .from('public_professional_profiles')
    .select('id, bio, city, neighborhood, is_available, is_verified, rating, total_reviews')
    .order('created_at', { ascending: false })
    .limit(12);

  if (error || !data || data.length === 0) {
    return professionals;
  }

  const realProfessionals: Professional[] = data.map((item, index) => ({
    id: item.id,
    name: `Profissional TAKE ${index + 1}`,
    specialty: item.bio ? 'Foto + Vídeo' : 'Profissional criativo',
    rating: Number(item.rating) || 4.8,
    reviewCount: item.total_reviews ?? 0,
    distanceKm: 'Perto de você',
    location: [item.neighborhood, item.city].filter(Boolean).join(', ') || 'Localização aproximada',
    imageUrl: professionals[index % professionals.length].imageUrl,
    verified: Boolean(item.is_verified),
    specialties: ['Fotografia', 'Vídeo', 'Eventos'],
    equipment: ['Equipamentos cadastrados no perfil'],
    portfolio: ['Portfólio cadastrado no Supabase'],
    availability: item.is_available ? 'Online agora' : 'Disponibilidade sob consulta',
  }));

  if (realProfessionals.length >= 3) {
    return realProfessionals;
  }

  return [...realProfessionals, ...professionals.slice(0, 3 - realProfessionals.length)];
}

export function getProfessionalById(id: string) {
  return professionals.find((professional) => professional.id === id) ?? professionals[0];
}

export function getIncomingTake() {
  return incomingTake;
}
