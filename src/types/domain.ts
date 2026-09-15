export type UserRole = 'client' | 'professional';

export type ServiceType = 'Fotografia' | 'Vídeo' | 'Foto + Vídeo' | 'Eventos';

export type Professional = {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  distanceKm: string;
  location: string;
  imageUrl: string;
  verified: boolean;
  priceFrom?: string;
  isMock?: boolean;
  specialties: string[];
  equipment: string[];
  portfolio: string[];
  availability: string;
};

export type ServiceOption = {
  id: string;
  title: ServiceType;
  description: string;
  accent: string;
};

export type IncomingTake = {
  type: 'Vídeo' | 'Foto' | 'Foto + Vídeo';
  duration: string;
  clientName: string;
  distanceKm: string;
  description: string;
  value: string;
};
