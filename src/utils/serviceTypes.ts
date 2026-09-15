import { ServiceTypeSlug } from '@/types/supabase';

export function serviceLabelToSlug(label: string): ServiceTypeSlug {
  const normalized = label.toLowerCase();

  if (normalized.includes('foto +')) return 'photo_video';
  if (normalized.includes('evento')) return 'event';
  if (normalized.includes('vídeo') || normalized.includes('video')) return 'video';
  return 'photography';
}

export function serviceSlugToLabel(serviceType: ServiceTypeSlug) {
  const labels: Record<ServiceTypeSlug, string> = {
    photography: 'Fotografia',
    video: 'Vídeo',
    photo_video: 'Foto + Vídeo',
    event: 'Eventos',
  };

  return labels[serviceType];
}

export function serviceSlugToSpecialty(serviceType: ServiceTypeSlug) {
  const labels: Record<ServiceTypeSlug, string> = {
    photography: 'Fotógrafo',
    video: 'Videomaker',
    photo_video: 'Foto + Vídeo',
    event: 'Eventos',
  };

  return labels[serviceType];
}

export function durationLabelToMinutes(label: string) {
  if (label.includes('30')) return 30;
  if (label.includes('2')) return 120;
  if (label.includes('4')) return 240;
  return 60;
}

export function durationMinutesToLabel(minutes: number) {
  if (minutes === 30) return '30 minutos';
  if (minutes === 60) return '1 hora';
  return `${Math.round(minutes / 60)} horas`;
}

export function estimatePrice(serviceType: ServiceTypeSlug, durationMinutes: number) {
  const basePrice: Record<ServiceTypeSlug, number> = {
    photography: 100,
    video: 120,
    photo_video: 180,
    event: 220,
  };

  return Math.round(basePrice[serviceType] * Math.max(1, durationMinutes / 60));
}
