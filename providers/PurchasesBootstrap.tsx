/**
 * Bootstrap RevenueCat une fois au démarrage (avant logIn Clerk).
 */
import { useEffect } from 'react';

import { ensurePurchasesConfigured } from '@/lib/revenuecat';

export function PurchasesBootstrap() {
  useEffect(() => {
    void ensurePurchasesConfigured();
  }, []);
  return null;
}
