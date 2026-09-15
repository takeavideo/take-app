import { incomingTake, professionals, services } from '@/data/mockData';

export function getServices() {
  return services;
}

export function getProfessionals() {
  return professionals;
}

export function getProfessionalById(id: string) {
  return professionals.find((professional) => professional.id === id) ?? professionals[0];
}

export function getIncomingTake() {
  return incomingTake;
}
