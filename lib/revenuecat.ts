/**
 * RevenueCat bridge (Phase 1)
 * ---------------------------
 * Expo Go ne charge pas bien `react-native-purchases` (module natif + résolution Metro).
 * Ici : stub sûr — Premium via `EXPO_PUBLIC_DEV_PREMIUM=1`.
 *
 * Phase 2 (dev build / EAS) : brancher le vrai SDK dans ce fichier.
 */
import type { CustomerInfo } from '@/lib/revenuecat-types';

export const PREMIUM_ENTITLEMENT_ID = 'premium';

export function isRevenueCatConfigured() {
  return false;
}

export async function ensurePurchasesConfigured(): Promise<boolean> {
  return false;
}

export async function identifyPurchasesUser(_clerkUserId: string): Promise<void> {
  /* no-op jusqu’au SDK natif */
}

export async function resetPurchasesUser(): Promise<void> {
  /* no-op */
}

export async function fetchCustomerInfo(
  _opts?: { force?: boolean },
): Promise<CustomerInfo | null> {
  return null;
}

export function hasPremiumEntitlement(info: CustomerInfo | null | undefined): boolean {
  if (!info) return false;
  return Boolean(info.entitlements?.active?.[PREMIUM_ENTITLEMENT_ID]);
}
