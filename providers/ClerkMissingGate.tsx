import { useEffect, useState, type ReactNode } from 'react';
import { useRouter, useSegments, type Href } from 'expo-router';

/** Fallback si la publishable key Clerk est absente : force /login. */
export function ClerkMissingGate({ children }: { children: ReactNode }) {
  const segments = useSegments();
  const router = useRouter();
  const [navReady, setNavReady] = useState(false);

  useEffect(() => {
    setNavReady(true);
  }, []);

  useEffect(() => {
    if (!navReady) return;
    if (segments[0] !== ('login' as (typeof segments)[0])) {
      router.replace('/login' as Href);
    }
  }, [segments, router, navReady]);

  return <>{children}</>;
}
