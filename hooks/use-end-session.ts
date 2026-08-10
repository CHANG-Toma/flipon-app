import { useCallback, useState } from 'react';

import { confirmDialog } from '@/lib/confirm-dialog';
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

const DEFAULT_TITLE = 'Mettre fin à la session ?';
const DEFAULT_MESSAGE =
  'La session sera fermée pour tout le monde. Les votes en cours ne seront pas comptés.';

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
        title = DEFAULT_TITLE,
        message = DEFAULT_MESSAGE,
        confirmLabel = 'Mettre fin',
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
        cancelLabel: 'Annuler',
        destructive: true,
      }).then((ok) => {
        if (ok) proceed();
      });
    },
    [ending, runEnd],
  );

  return { endSession, ending };
}
