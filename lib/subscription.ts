/**
 * Abonnement (placeholder Basique)
 * --------------------------------
 * Plan actuel = Basique. Boost / IAP (RevenueCat) à brancher plus tard.
 * Ne pas activer Boost côté client sans vérif serveur.
 */
export type FlipOnPlan = 'basique' | 'boost';

export type SubscriptionSnapshot = {
  plan: FlipOnPlan;
  label: string;
  priceLabel: string;
};

/** Source de vérité locale tant que le billing n’existe pas. */
export function getSubscription(): SubscriptionSnapshot {
  return {
    plan: 'basique',
    label: 'Basique',
    priceLabel: 'Gratuit',
  };
}

export function isBoostActive(sub: SubscriptionSnapshot = getSubscription()) {
  return sub.plan === 'boost';
}
