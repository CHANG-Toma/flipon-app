import { useCallback, useState } from 'react';
import { useUser } from '@clerk/clerk-expo';

import { changeFlipOnPassword } from '@/lib/auth/change-password';
import { validatePasswordPair } from '@/lib/auth/password-policy';
import { canChangeFlipOnPassword } from '@/lib/auth/user-capabilities';
import { tr } from '@/lib/i18n';

type Feedback =
  | { type: 'success'; message: string }
  | { type: 'error'; message: string }
  | null;

export function useChangePassword() {
  const { user, isLoaded } = useUser();
  const available = isLoaded && canChangeFlipOnPassword(user);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const clearError = useCallback(() => {
    setFeedback((prev) => (prev?.type === 'error' ? null : prev));
  }, []);

  const submit = useCallback(async () => {
    if (!user || !available || busy) return;

    if (!currentPassword) {
      setFeedback({ type: 'error', message: tr('password.needCurrent') });
      return;
    }

    const validation = validatePasswordPair(newPassword, confirmPassword);
    if (!validation.ok) {
      setFeedback({ type: 'error', message: validation.message });
      return;
    }

    setBusy(true);
    setFeedback(null);
    try {
      await changeFlipOnPassword(user, currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setFeedback({ type: 'success', message: tr('password.success') });
    } catch (e) {
      setFeedback({
        type: 'error',
        message: e instanceof Error ? e.message : tr('password.failed'),
      });
    } finally {
      setBusy(false);
    }
  }, [user, available, busy, currentPassword, newPassword, confirmPassword]);

  return {
    available,
    currentPassword,
    newPassword,
    confirmPassword,
    busy,
    feedback,
    setCurrentPassword,
    setNewPassword,
    setConfirmPassword,
    clearError,
    submit,
  };
}
