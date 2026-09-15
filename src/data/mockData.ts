import { colors } from '@/constants/theme';
import { IncomingTake, Professional, ServiceOption } from '@/types/domain';

export const services: ServiceOption[] = [
  {
    id: 'photo',
    title: 'Fotografia',
    description: 'Ensaios, produtos e conteúdo social.',
    accent: colors.primary,
  },
  {
    id: 'video',
    title: 'Vídeo',
    description: 'Reels, institucionais e captações rápidas.',
    accent: '#FF7A1A',
  },
  {
    id: 'photo-video',
    title: 'Foto + Vídeo',
    description: 'Pacote completo para sua produção.',
    accent: '#242424',
  },
  {
    id: 'events',
    title: 'Eventos',
    description: 'Cobertura pontual para encontros e ações.',
    accent: '#7C5C2D',
  },
];

export const professionals: Professional[] = [
  {
    id: 'lucas-oliveira',
    name: 'Lucas Oliveira',
    specialty: 'Videomaker',
    rating: 4.9,
    reviewCount: 86,
    distanceKm: '2,4 km',
    location: 'Vila Mariana, São Paulo',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    verified: true,
    specialties: ['Reels', 'Conteúdo fitness', 'Vídeo institucional'],
    equipment: ['Sony A7 IV', 'Gimbal DJI RS 3', 'Microfone lapela', 'Luz LED portátil'],
    portfolio: ['Treino funcional', 'Restaurante autoral', 'Evento corporativo'],
    availability: 'Disponível hoje a partir das 14h',
  },
  {
    id: 'ana-martins',
    name: 'Ana Martins',
    specialty: 'Fotógrafa',
    rating: 5,
    reviewCount: 124,
    distanceKm: '1,8 km',
    location: 'Pinheiros, São Paulo',
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    verified: true,
    specialties: ['Produtos', 'Retratos', 'Gastronomia'],
    equipment: ['Canon R6', 'Lente 50mm 1.4', 'Softbox compacto', 'Tripé Manfrotto'],
    portfolio: ['Menu de restaurante', 'Retratos profissionais', 'Coleção de roupas'],
    availability: 'Online agora',
  },
  {
    id: 'carlos-souza',
    name: 'Carlos Souza',
    specialty: 'Foto + Vídeo',
    rating: 4.8,
    reviewCount: 63,
    distanceKm: '3,1 km',
    location: 'Moema, São Paulo',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    verified: true,
    specialties: ['Eventos', 'Imóveis', 'Conteúdo comercial'],
    equipment: ['Nikon Z6 II', 'Drone DJI Mini 4 Pro', 'Gravador Zoom', 'Kit LED'],
    portfolio: ['Open house', 'Evento em igreja', 'Lançamento de produto'],
    availability: 'Disponível amanhã pela manhã',
  },
];

export const incomingTake: IncomingTake = {
  type: 'Vídeo',
  duration: '1 hora',
  clientName: 'Mariana',
  distanceKm: '2,3 km',
  description: 'Preciso gravar conteúdos para Instagram durante meu treino.',
  value: 'R$ 120',
};
