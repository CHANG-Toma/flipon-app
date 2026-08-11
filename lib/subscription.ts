/**
 * Abonnement (placeholder Basique)
 * --------------------------------
 * Plan actuel = Basique. Premium / IAP (RevenueCat) à brancher plus tard.
 * Ne pas activer Premium côté client sans vérif serveur.
 */
import { tr } from '@/lib/i18n';

export type FlipOnPlan = 'basique' | 'premium';

export type SubscriptionSnapshot = {
  plan: FlipOnPlan;
  label: string;
  priceLabel: string;
};

/** Source de vérité locale tant que le billing n’existe pas. */
export function getSubscription(): SubscriptionSnapshot {
  return {
    plan: 'basique',
    label: tr('subscription.freeTitle'),
    priceLabel: tr('subscription.freeEyebrow'),
  };
}

export function isPremiumActive(sub: SubscriptionSnapshot = getSubscription()) {
  return sub.plan === 'premium';
}
