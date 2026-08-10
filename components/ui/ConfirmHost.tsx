import { useEffect, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { FlipOn } from '@/constants/flipon';
import {
  registerConfirmDialog,
  type ConfirmDialogOptions,
} from '@/lib/confirm-dialog';
import { useI18n } from '@/lib/i18n';

type Pending = ConfirmDialogOptions & { id: number };

export function ConfirmHost() {
  const { t } = useI18n();
  const [pending, setPending] = useState<Pending | null>(null);
  const resolveRef = useRef<((value: boolean) => void) | null>(null);
  const idRef = useRef(0);

  useEffect(() => {
    registerConfirmDialog((options) => {
      return new Promise<boolean>((resolve) => {
        resolveRef.current = resolve;
        idRef.current += 1;
        setPending({ ...options, id: idRef.current });
      });
    });

    return () => registerConfirmDialog(null);
  }, []);

  const close = (value: boolean) => {
    resolveRef.current?.(value);
    resolveRef.current = null;
    setPending(null);
  };

  return (
    <Modal
      visible={pending !== null}
      transparent
      animationType="fade"
      onRequestClose={() => close(false)}>
      <View style={styles.backdrop}>
        <View style={styles.card} accessibilityViewIsModal>
          <Text style={styles.title}>{pending?.title}</Text>
          <Text style={styles.message}>{pending?.message}</Text>

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [styles.btn, styles.cancelBtn, pressed && styles.pressed]}
              onPress={() => close(false)}>
              <Text style={styles.cancelText}>{pending?.cancelLabel ?? t('common.cancel')}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.btn,
                pending?.destructive ? styles.dangerBtn : styles.confirmBtn,
                pressed && styles.pressed,
              ]}
              onPress={() => close(true)}>
              <Text style={pending?.destructive ? styles.dangerText : styles.confirmText}>
                {pending?.confirmLabel ?? t('confirm.confirm')}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(18, 20, 26, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: FlipOn.surface,
    borderRadius: 20,
    padding: 20,
    gap: 10,
    borderWidth: 1,
    borderColor: FlipOn.line,
  },
  title: { fontSize: 18, fontWeight: '800', color: FlipOn.ink, textAlign: 'center' },
  message: {
    fontSize: 14,
    lineHeight: 21,
    color: FlipOn.muted,
    textAlign: 'center',
    marginBottom: 6,
  },
  actions: { flexDirection: 'row', gap: 10 },
  btn: {
    flex: 1,
    minHeight: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  cancelBtn: {
    backgroundColor: FlipOn.soft,
    borderWidth: 1,
    borderColor: FlipOn.line,
  },
  confirmBtn: { backgroundColor: FlipOn.accent },
  dangerBtn: { backgroundColor: FlipOn.danger },
  cancelText: { fontSize: 15, fontWeight: '700', color: FlipOn.ink },
  confirmText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  dangerText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  pressed: { opacity: 0.88 },
});
