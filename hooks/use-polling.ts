import { useCallback, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

type Options = {
  enabled: boolean;
  intervalMs?: number;
  /** Refresh immédiat quand l’écran reprend le focus. */
  runOnFocus?: boolean;
};

/**
 * Polling mobile-safe : pause en arrière-plan, pas de tick chevauché,
 * cleanup à l’unmount / blur.
 */
export function usePolling(tick: () => void | Promise<void>, options: Options) {
  const { enabled, intervalMs = 1500, runOnFocus = true } = options;
  const tickRef = useRef(tick);
  const inFlight = useRef(false);
  const appState = useRef<AppStateStatus>(AppState.currentState);

  tickRef.current = tick;

  const run = useCallback(async () => {
    if (inFlight.current) return;
    if (appState.current !== 'active') return;
    inFlight.current = true;
    try {
      await tickRef.current();
    } finally {
      inFlight.current = false;
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!enabled) return undefined;
      if (runOnFocus) void run();

      const id = setInterval(() => {
        void run();
      }, intervalMs);

      const onAppState = (next: AppStateStatus) => {
        const wasBackground = appState.current.match(/inactive|background/);
        appState.current = next;
        if (wasBackground && next === 'active') void run();
      };
      const sub = AppState.addEventListener('change', onAppState);

      return () => {
        clearInterval(id);
        sub.remove();
      };
    }, [enabled, intervalMs, run, runOnFocus]),
  );
}
