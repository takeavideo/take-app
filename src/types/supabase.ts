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
