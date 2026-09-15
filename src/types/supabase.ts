export type UserType = 'client' | 'professional';
export type ServiceTypeSlug = 'photography' | 'video' | 'photo_video' | 'event';
export type PortfolioMediaType = 'image' | 'video';

export type Profile = {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string | null;
  city: string | null;
  avatar_url: string | null;
  user_type: UserType;
  created_at: string;
  updated_at: string;
};

export type ProfessionalProfile = {
  id: string;
  user_id: string;
  bio: string | null;
  city: string | null;
  neighborhood: string | null;
  latitude: number | null;
  longitude: number | null;
  is_available: boolean;
  is_verified: boolean;
  rating: number;
  total_reviews: number;
  created_at: string;
  updated_at: string;
};

export type ProfessionalService = {
  id: string;
  professional_id: string;
  service_type: ServiceTypeSlug;
  price_from: number | null;
};

export type ProfessionalEquipment = {
  id: string;
  professional_id: string;
  name: string;
  category: string | null;
};

export type PortfolioItem = {
  id: string;
  professional_id: string;
  media_url: string;
  media_type: PortfolioMediaType;
  description: string | null;
  created_at: string;
};

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type NearbyProfessional = {
  professional_id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  city: string | null;
  neighborhood: string | null;
  is_verified: boolean;
  rating: number;
  total_reviews: number;
  service_type: ServiceTypeSlug;
  price_from: number | null;
  distance_km: number;
};

export type NearbyServiceRequest = {
  request_id: string;
  service_type: ServiceTypeSlug;
  description: string | null;
  scheduled_for: string | null;
  duration_minutes: number;
  city: string | null;
  neighborhood: string | null;
  estimated_price: number | null;
  distance_km: number;
  created_at: string;
};

export type AcceptedServiceRequest = {
  request_id: string;
  service_type: ServiceTypeSlug;
  description: string | null;
  scheduled_for: string | null;
  duration_minutes: number;
  city: string | null;
  neighborhood: string | null;
  estimated_price: number | null;
  status: 'accepted' | 'in_progress' | 'completed';
  created_at: string;
};

export type ServiceRequest = {
  id: string;
  client_id: string;
  accepted_professional_id: string | null;
  service_type: ServiceTypeSlug;
  description: string | null;
  scheduled_for: string | null;
  duration_minutes: number;
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  neighborhood: string | null;
  status: 'searching' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  estimated_price: number | null;
  created_at: string;
  updated_at: string;
};
