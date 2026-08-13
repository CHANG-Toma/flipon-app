/**
 * Hook abonnement — RevenueCat `Flipon Pro` + `/api/me` + EXPO_PUBLIC_DEV_PREMIUM.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@clerk/clerk-expo';

import {
  hasPremiumEntitlement,
  subscribeCustomerInfo,
} from '@/lib/revenuecat';
import {
  getSubscription,
  isDevPremiumOverride,
  isPremiumActive,
  resolveSubscriptionPlan,
  subscriptionSnapshot,
  type FlipOnPlan,
  type SubscriptionSnapshot,
} from '@/lib/subscription';

export type UseSubscriptionResult = SubscriptionSnapshot & {
  isLoaded: boolean;
  isPremium: boolean;
  plan: FlipOnPlan;
  reload: () => Promise<void>;
};

export function useSubscription(): UseSubscriptionResult {
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const [plan, setPlan] = useState<FlipOnPlan>(() => getSubscription().plan);
  const [isLoaded, setIsLoaded] = useState(false);
  const requestId = useRef(0);

  const reload = useCallback(async (force = false) => {
    if (!authLoaded) return;
    const id = ++requestId.current;

    if (!isSignedIn && !isDevPremiumOverride()) {
      if (id !== requestId.current) return;
      setPlan('basique');
      setIsLoaded(true);
      return;
    }

    try {
      const next = await resolveSubscriptionPlan({ force });
      if (id !== requestId.current) return;
      setPlan(next);
    } catch {
      if (id !== requestId.current) return;
      setPlan(isDevPremiumOverride() ? 'premium' : 'basique');
    } finally {
      if (id === requestId.current) setIsLoaded(true);
    }
  }, [authLoaded, isSignedIn]);

  useEffect(() => {
    void reload(false);
  }, [reload]);

  useEffect(() => {
    return subscribeCustomerInfo((info) => {
      if (hasPremiumEntitlement(info)) {
        setPlan('premium');
        setIsLoaded(true);
      }
    });
  }, []);

  const snap = useMemo(() => subscriptionSnapshot(plan), [plan]);

  return {
    ...snap,
    plan,
    isLoaded: authLoaded && isLoaded,
    isPremium: isPremiumActive(plan),
    reload: () => reload(true),
  };
}
