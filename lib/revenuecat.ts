/**
 * RevenueCat — achats in-app (FlipOn Pro)
 * ---------------------------------------
 * Entitlement dashboard : `Flipon Pro`
 * Produits offering : `monthly`, `yearly`
 *
 * Expo Go : Preview API Mode (pas d’achat réel).
 * Achats sandbox : dev build EAS (`npx expo run:ios` / `eas build`).
 */
import { Platform } from 'react-native';
import Purchases, {
  LOG_LEVEL,
  type CustomerInfo,
  type PurchasesOffering,
  type PurchasesPackage,
} from 'react-native-purchases';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';

export const PREMIUM_ENTITLEMENT_ID = 'Flipon Pro';
export const RC_PRODUCT_MONTHLY = 'monthly';
export const RC_PRODUCT_YEARLY = 'yearly';

export type FlipOnRcPackage = typeof RC_PRODUCT_MONTHLY | typeof RC_PRODUCT_YEARLY;

export type PaywallAccess = 'granted' | 'dismissed' | 'error';

type CustomerInfoListener = (info: CustomerInfo) => void;

let configurePromise: Promise<boolean> | null = null;
let cachedInfo: CustomerInfo | null = null;
let cachedAt = 0;
const CACHE_TTL_MS = 30_000;
const infoListeners = new Set<CustomerInfoListener>();

function apiKeyForPlatform(): string {
  const shared = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY?.trim() || '';
  if (Platform.OS === 'ios') {
    return process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS?.trim() || shared;
  }
  if (Platform.OS === 'android') {
    return process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID?.trim() || shared;
  }
  return shared;
}

export function isRevenueCatConfigured() {
  return Boolean(apiKeyForPlatform());
}

function emitCustomerInfo(info: CustomerInfo) {
  cachedInfo = info;
  cachedAt = Date.now();
  infoListeners.forEach((listener) => listener(info));
}

export function subscribeCustomerInfo(listener: CustomerInfoListener) {
  infoListeners.add(listener);
  if (cachedInfo) listener(cachedInfo);
  return () => {
    infoListeners.delete(listener);
  };
}

export function hasPremiumEntitlement(info: CustomerInfo | null | undefined): boolean {
  if (!info) return false;
  const active = info.entitlements.active;
  return (
    typeof active[PREMIUM_ENTITLEMENT_ID] !== 'undefined' ||
    typeof active.premium !== 'undefined'
  );
}

async function configurePurchases(): Promise<boolean> {
  if (Platform.OS !== 'ios' && Platform.OS !== 'android') return false;

  const apiKey = apiKeyForPlatform();
  if (!apiKey) return false;

  try {
    await Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.VERBOSE : LOG_LEVEL.WARN);
    if (await Purchases.isConfigured()) {
      Purchases.addCustomerInfoUpdateListener(emitCustomerInfo);
      return true;
    }

    Purchases.configure({ apiKey });
    Purchases.addCustomerInfoUpdateListener(emitCustomerInfo);
    return true;
  } catch (error) {
    if (__DEV__) {
      console.warn('[RevenueCat] configure failed', error);
    }
    return false;
  }
}

export function ensurePurchasesConfigured(): Promise<boolean> {
  if (!configurePromise) {
    configurePromise = configurePurchases().catch(() => false);
  }
  return configurePromise;
}

export async function identifyPurchasesUser(clerkUserId: string): Promise<void> {
  const ready = await ensurePurchasesConfigured();
  if (!ready || !clerkUserId) return;

  try {
    const { customerInfo } = await Purchases.logIn(clerkUserId);
    emitCustomerInfo(customerInfo);
  } catch (error) {
    if (__DEV__) {
      console.warn('[RevenueCat] logIn failed', error);
    }
  }
}

export async function resetPurchasesUser(): Promise<void> {
  const ready = await ensurePurchasesConfigured();
  cachedInfo = null;
  cachedAt = 0;
  if (!ready) return;

  try {
    const info = await Purchases.logOut();
    emitCustomerInfo(info);
  } catch {
    /* déjà anonyme / Preview API */
  }
}

export async function fetchCustomerInfo(opts?: {
  force?: boolean;
}): Promise<CustomerInfo | null> {
  const ready = await ensurePurchasesConfigured();
  if (!ready) return null;

  if (!opts?.force && cachedInfo && Date.now() - cachedAt < CACHE_TTL_MS) {
    return cachedInfo;
  }

  try {
    const info = await Purchases.getCustomerInfo();
    emitCustomerInfo(info);
    return info;
  } catch (error) {
    if (__DEV__) {
      console.warn('[RevenueCat] getCustomerInfo failed', error);
    }
    return cachedInfo;
  }
}

export async function getCurrentOffering(): Promise<PurchasesOffering | null> {
  const ready = await ensurePurchasesConfigured();
  if (!ready) return null;

  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current ?? null;
  } catch (error) {
    if (__DEV__) {
      console.warn('[RevenueCat] getOfferings failed', error);
    }
    return null;
  }
}

function packageMatches(pkg: PurchasesPackage, id: FlipOnRcPackage): boolean {
  const aliases =
    id === RC_PRODUCT_MONTHLY
      ? [RC_PRODUCT_MONTHLY, '$rc_monthly']
      : [RC_PRODUCT_YEARLY, 'annual', '$rc_annual', '$rc_yearly'];
  return aliases.includes(pkg.identifier) || aliases.includes(pkg.product.identifier);
}

export async function getPackage(
  id: FlipOnRcPackage,
): Promise<PurchasesPackage | null> {
  const offering = await getCurrentOffering();
  if (!offering) return null;

  const fromList = offering.availablePackages.find((pkg) => packageMatches(pkg, id));
  if (fromList) return fromList;
  return id === RC_PRODUCT_MONTHLY ? offering.monthly ?? null : offering.annual ?? null;
}

export function isUserCancelledPurchase(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const e = error as { userCancelled?: boolean; code?: string | number };
  if (e.userCancelled) return true;
  return String(e.code) === '1' || String(e.code).includes('PURCHASE_CANCELLED');
}

export async function purchasePackageById(id: FlipOnRcPackage): Promise<CustomerInfo | null> {
  const pkg = await getPackage(id);
  if (!pkg) {
    throw new Error(`Offering package "${id}" introuvable.`);
  }

  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    emitCustomerInfo(customerInfo);
    return customerInfo;
  } catch (error) {
    if (isUserCancelledPurchase(error)) return null;
    throw error;
  }
}

export async function restorePurchases(): Promise<CustomerInfo | null> {
  const ready = await ensurePurchasesConfigured();
  if (!ready) return null;

  const info = await Purchases.restorePurchases();
  emitCustomerInfo(info);
  return info;
}

export async function presentFlipOnPaywall(): Promise<PaywallAccess> {
  const ready = await ensurePurchasesConfigured();
  if (!ready) return 'error';

  try {
    const offering = await getCurrentOffering();
    const result = await RevenueCatUI.presentPaywall({
      offering: offering ?? undefined,
      displayCloseButton: true,
    });

    switch (result) {
      case PAYWALL_RESULT.PURCHASED:
      case PAYWALL_RESULT.RESTORED:
        await fetchCustomerInfo({ force: true });
        return 'granted';
      case PAYWALL_RESULT.NOT_PRESENTED:
      case PAYWALL_RESULT.ERROR:
        return 'error';
      default:
        return 'dismissed';
    }
  } catch (error) {
    if (__DEV__) {
      console.warn('[RevenueCat] presentPaywall failed', error);
    }
    return 'error';
  }
}

export async function presentFlipOnCustomerCenter(): Promise<boolean> {
  const ready = await ensurePurchasesConfigured();
  if (!ready) return false;

  try {
    await RevenueCatUI.presentCustomerCenter();
    await fetchCustomerInfo({ force: true });
    return true;
  } catch (error) {
    if (__DEV__) {
      console.warn('[RevenueCat] presentCustomerCenter failed', error);
    }
    return false;
  }
}
