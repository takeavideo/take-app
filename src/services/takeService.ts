import { incomingTake, professionals, services } from '@/data/mockData';
import { isSupabaseConfigured } from '@/lib/env';
import { searchNearbyProfessionals } from '@/services/marketplaceService';
import { Professional } from '@/types/domain';
import { Coordinates, NearbyProfessional, ServiceTypeSlug } from '@/types/supabase';
import { serviceSlugToSpecialty } from '@/utils/serviceTypes';

export function getServices() {
  return services;
}

export function getProfessionals() {
  return professionals;
}

export async function getAvailableProfessionals(input?: {
  location?: Coordinates;
  serviceType?: ServiceTypeSlug | null;
}) {
  if (!isSupabaseConfigured) {
    return professionals;
  }

  if (!input?.location) {
    return professionals;
  }

  const data = await searchNearbyProfessionals({
    latitude: input.location.latitude,
    longitude: input.location.longitude,
    radiusKm: 10,
    serviceType: input.serviceType ?? null,
  });

  if (data.length === 0) return professionals;

  const realProfessionals: Professional[] = data.map(mapNearbyProfessional);

  if (realProfessionals.length >= 3) {
    return realProfessionals;
  }

  return [...realProfessionals, ...professionals.slice(0, 3 - realProfessionals.length)];
}

function mapNearbyProfessional(item: NearbyProfessional, index: number): Professional {
  return {
    id: item.professional_id,
    name: item.display_name || `Profissional TAKE ${index + 1}`,
    specialty: serviceSlugToSpecialty(item.service_type),
    rating: Number(item.rating) || 0,
    reviewCount: item.total_reviews ?? 0,
    distanceKm: `${Number(item.distance_km).toFixed(1).replace('.', ',')} km`,
    location: [item.neighborhood, item.city].filter(Boolean).join(', ') || 'Localização aproximada',
    imageUrl: item.avatar_url || professionals[index % professionals.length].imageUrl,
    verified: Boolean(item.is_verified),
    priceFrom: item.price_from ? `A partir de R$${Number(item.price_from).toFixed(0)}` : undefined,
    specialties: [serviceSlugToSpecialty(item.service_type)],
    equipment: ['Equipamentos cadastrados no perfil'],
    portfolio: ['Portfólio cadastrado no Supabase'],
    availability: 'Online agora',
  };
}

export function getProfessionalById(id: string) {
  return professionals.find((professional) => professional.id === id) ?? professionals[0];
}

export function getIncomingTake() {
  return incomingTake;
}
