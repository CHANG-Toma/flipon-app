import { PremiumLoader } from '@/components/ui/PremiumLoader';

/** Splash brand pendant le boot auth (overlay premium). */
export function SplashBoot() {
  return <PremiumLoader fullScreen />;
}
