import { supabase } from '@/lib/supabase';
import {
  AcceptedServiceRequest,
  Coordinates,
  NearbyProfessional,
  NearbyServiceRequest,
  ServiceRequestMessage,
  ServiceRequest,
  ServiceTypeSlug,
} from '@/types/supabase';

export type PublicProfessionalProfile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  city: string | null;
  neighborhood: string | null;
  is_available: boolean;
  is_verified: boolean;
  rating: number;
  total_reviews: number;
};

export type CreateServiceRequestInput = Coordinates & {
  clientId: string;
  serviceType: ServiceTypeSlug;
  description: string;
  durationMinutes: number;
  city?: string | null;
  neighborhood?: string | null;
  estimatedPrice?: number | null;
};

export async function searchNearbyProfessionals(input: {
  latitude: number;
  longitude: number;
  radiusKm?: number;
  serviceType?: ServiceTypeSlug | null;
}) {
  const { data, error } = await supabase.rpc('search_nearby_professionals', {
    client_latitude: input.latitude,
    client_longitude: input.longitude,
    radius_km: input.radiusKm ?? 10,
    requested_service_type: input.serviceType ?? null,
  });

  if (error) throw error;
  return (data ?? []) as NearbyProfessional[];
}

export async function createServiceRequest(input: CreateServiceRequestInput) {
  const { data, error } = await supabase
    .from('service_requests')
    .insert({
      client_id: input.clientId,
      service_type: input.serviceType,
      description: input.description,
      duration_minutes: input.durationMinutes,
      latitude: input.latitude,
      longitude: input.longitude,
      city: input.city ?? null,
      neighborhood: input.neighborhood ?? null,
      status: 'searching',
      estimated_price: input.estimatedPrice ?? null,
    })
    .select('id,client_id,accepted_professional_id,service_type,description,scheduled_for,duration_minutes,latitude,longitude,city,neighborhood,status,estimated_price,created_at,updated_at')
    .single<ServiceRequest>();

  if (error) throw error;
  return data;
}

export async function getServiceRequestForClient(requestId: string) {
  const { data, error } = await supabase
    .from('service_requests')
    .select('id,client_id,accepted_professional_id,service_type,description,scheduled_for,duration_minutes,latitude,longitude,city,neighborhood,status,estimated_price,created_at,updated_at')
    .eq('id', requestId)
    .single<ServiceRequest>();

  if (error) throw error;
  return data;
}

export async function cancelServiceRequest(requestId: string) {
  const { data, error } = await supabase.rpc('cancel_service_request', {
    request_id: requestId,
  });

  if (error) throw error;
  return data;
}

export async function getNearbyServiceRequests(radiusKm = 10) {
  const { data, error } = await supabase.rpc('get_nearby_service_requests', {
    radius_km: radiusKm,
  });

  if (error) throw error;
  return (data ?? []) as NearbyServiceRequest[];
}

export async function acceptServiceRequest(requestId: string) {
  const { data, error } = await supabase.rpc('accept_service_request', {
    request_id: requestId,
  });

  if (error) throw error;
  return (data ?? []) as AcceptedServiceRequest[];
}

export async function getAcceptedServiceRequest(requestId: string) {
  const { data, error } = await supabase.rpc('get_accepted_service_request', {
    request_id: requestId,
  });

  if (error) throw error;
  return ((data ?? []) as AcceptedServiceRequest[])[0] ?? null;
}

export async function startServiceRequest(requestId: string) {
  const { data, error } = await supabase.rpc('start_service_request', {
    p_request_id: requestId,
  });

  if (error) throw error;
  return ((data ?? []) as { request_id: string; status: string; updated_at: string }[])[0] ?? null;
}

export async function completeServiceRequest(requestId: string) {
  const { data, error } = await supabase.rpc('complete_service_request', {
    p_request_id: requestId,
  });

  if (error) throw error;
  return ((data ?? []) as { request_id: string; status: string; updated_at: string }[])[0] ?? null;
}

export async function getServiceRequestMessages(requestId: string) {
  const { data, error } = await supabase.rpc('get_service_request_messages', {
    p_service_request_id: requestId,
  });

  if (error) throw error;
  return (data ?? []) as ServiceRequestMessage[];
}

export async function sendServiceRequestMessage(requestId: string, message: string) {
  const { data, error } = await supabase.rpc('send_service_request_message', {
    p_service_request_id: requestId,
    p_message: message,
  });

  if (error) throw error;
  return ((data ?? []) as ServiceRequestMessage[])[0] ?? null;
}

export async function markServiceRequestMessagesRead(requestId: string) {
  const { data, error } = await supabase.rpc('mark_service_request_messages_read', {
    p_service_request_id: requestId,
  });

  if (error) throw error;
  return Number(data ?? 0);
}

export async function getPublicProfessionalProfile(professionalId: string) {
  const { data, error } = await supabase
    .from('public_professional_profiles')
    .select('id,display_name,avatar_url,bio,city,neighborhood,is_available,is_verified,rating,total_reviews')
    .eq('id', professionalId)
    .single<PublicProfessionalProfile>();

  if (error) throw error;
  return data;
}
