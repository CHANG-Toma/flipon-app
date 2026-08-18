/**
 * Abonnement FlipOn — un seul plan (Premium), essai 7 jours.
 * -----------------------------------------------------------
 * Source client : RevenueCat entitlement `Flipon Pro`, puis `/api/me` (webhook).
 * `basique` = pas d'abonnement actif (état interne, jamais exposé comme offre).
 */
import { syncMe } from '@/lib/api/me';
import { tr } from '@/lib/i18n';
import {
  fetchCustomerInfo,
  hasPremiumEntitlement,
} from '@/lib/revenuecat';

export type FlipOnPlan = 'basique' | 'premium';

export type SubscriptionSnapshot = {
  plan: FlipOnPlan;
  label: string;
  priceLabel: string;
};

/** Override UI uniquement — jamais en production. */
export function isDevPremiumOverride(): boolean {
  if (!__DEV__) return false;
  const raw = process.env.EXPO_PUBLIC_DEV_PREMIUM?.trim().toLowerCase();
  return raw === '1' || raw === 'true' || raw === 'yes';
}

export function subscriptionSnapshot(plan: FlipOnPlan): SubscriptionSnapshot {
  return {
    plan,
    label:
      plan === 'premium'
        ? tr('subscription.premiumTitle')
        : tr('subscription.inactiveTitle'),
    priceLabel:
      plan === 'premium'
        ? tr('subscription.premiumPrice')
        : tr('subscription.inactivePrice'),
  };
}

export function isPremiumActive(
  planOrSub: FlipOnPlan | SubscriptionSnapshot = 'basique',
) {
  const plan = typeof planOrSub === 'string' ? planOrSub : planOrSub.plan;
  return plan === 'premium';
}

/** Snapshot synchrone sans réseau — inactif sauf DEV override. */
export function getSubscription(): SubscriptionSnapshot {
  return subscriptionSnapshot(isDevPremiumOverride() ? 'premium' : 'basique');
}

/** Lit le plan : RevenueCat d'abord, puis l'API (webhook / essai web). */
export async function resolveSubscriptionPlan(
  opts?: { force?: boolean },
): Promise<FlipOnPlan> {
  if (isDevPremiumOverride()) return 'premium';
  try {
    const info = await fetchCustomerInfo({ force: opts?.force });
    if (hasPremiumEntitlement(info)) return 'premium';
  } catch {
    /* SDK indisponible */
  }
  try {
    const me = await syncMe();
    if (me.isPremium || me.plan === 'premium') return 'premium';
  } catch {
    /* réseau / non sync */
  }
  return 'basique';
}
