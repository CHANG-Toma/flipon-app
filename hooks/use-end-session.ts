import { useCallback, useState } from 'react';

import { confirmDialog } from '@/lib/confirm-dialog';
import { tr } from '@/lib/i18n';
import { clearActiveSession } from '@/lib/session/store';

type EndSessionOptions = {
  /** Demande confirmation (défaut : true pour session en cours). */
  confirm?: boolean;
  /** Titre de la boîte de dialogue. */
  title?: string;
  /** Message custom dans la boîte de dialogue. */
  message?: string;
  /** Libellé du bouton de confirmation. */
  confirmLabel?: string;
  afterEnd?: () => void;
};

/**
 * Ferme la session active (API close + purge locale) avec confirmation optionnelle.
 */
export function useEndSession() {
  const [ending, setEnding] = useState(false);

  const runEnd = useCallback(async (afterEnd?: () => void) => {
    setEnding(true);
    try {
      await clearActiveSession();
      afterEnd?.();
    } finally {
      setEnding(false);
    }
  }, []);

  const endSession = useCallback(
    (options?: EndSessionOptions) => {
      if (ending) return;

      const {
        confirm = true,
        title = tr('endSession.title'),
        message = tr('endSession.message'),
        confirmLabel = tr('endSession.confirm'),
        afterEnd,
      } = options ?? {};

      const proceed = () => void runEnd(afterEnd);

      if (!confirm) {
        proceed();
        return;
      }

      void confirmDialog({
        title,
        message,
        confirmLabel,
        cancelLabel: tr('common.cancel'),
        destructive: true,
      }).then((ok) => {
        if (ok) proceed();
      });
    },
    [ending, runEnd],
  );

  return { endSession, ending };
}
