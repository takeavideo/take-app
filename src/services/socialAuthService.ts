export type PlannedAuthProvider = 'google' | 'apple' | 'phone';

export const plannedAuthProviders: PlannedAuthProvider[] = ['google', 'apple', 'phone'];

export function getPlannedAuthMessage(provider: PlannedAuthProvider) {
  const labels: Record<PlannedAuthProvider, string> = {
    google: 'Google',
    apple: 'Apple',
    phone: 'telefone',
  };

  return `Autenticação por ${labels[provider]} será adicionada em uma etapa futura.`;
}
