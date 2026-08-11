/**
 * Abonnement FlipOn (Basique / Premium)
 * -------------------------------------
 * Source client : RevenueCat entitlement `premium` (+ override DEV).
 * Source serveur : table Prisma Subscription (webhook RC) — ne pas se fier au seul client.
 */
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
        : tr('subscription.freeTitle'),
    priceLabel:
      plan === 'premium'
        ? tr('subscription.premiumPrice')
        : tr('subscription.freeEyebrow'),
  };
}

export function isPremiumActive(
  planOrSub: FlipOnPlan | SubscriptionSnapshot = 'basique',
) {
  const plan = typeof planOrSub === 'string' ? planOrSub : planOrSub.plan;
  return plan === 'premium';
}

/** Snapshot synchrone sans RC — Basique sauf DEV override. */
export function getSubscription(): SubscriptionSnapshot {
  return subscriptionSnapshot(isDevPremiumOverride() ? 'premium' : 'basique');
}

/** Lit le plan depuis RevenueCat CustomerInfo (+ DEV override). */
export async function resolveSubscriptionPlan(
  opts?: { force?: boolean },
): Promise<FlipOnPlan> {
  if (isDevPremiumOverride()) return 'premium';
  const info = await fetchCustomerInfo(opts);
  return hasPremiumEntitlement(info) ? 'premium' : 'basique';
}
