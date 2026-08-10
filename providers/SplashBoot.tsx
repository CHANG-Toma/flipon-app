import { PremiumLoader } from '@/components/ui/PremiumLoader';

type Props = {
  message?: string;
};

/** Splash brand pendant le boot auth (overlay premium). */
export function SplashBoot({ message }: Props) {
  return <PremiumLoader fullScreen message={message} />;
}
