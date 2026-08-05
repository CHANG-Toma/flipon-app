import { useCallback, useEffect, useRef } from 'react';

/** Ignore les updates après unmount (navigations async). */
export function useMounted() {
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  return useCallback(() => mounted.current, []);
}
