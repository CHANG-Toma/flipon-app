/**
 * Détail d’une entrée d’historique
 * --------------------------------
 * Idée retenue (Basique : pas d’étapes), partage, relancer, supprimer local.
 */
import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { Screen } from '@/components/ui/Screen';
import { EmptyState } from '@/components/ui/EmptyState';
import { FlipOn } from '@/constants/flipon';
import { getPlanById } from '@/data/plans';
import { displayHistoryTitle, formatHistoryMeta } from '@/lib/history/format';
import {
  getHistoryEntry,
  hydrateHistory,
  removeHistoryEntry,
  subscribeHistory,
} from '@/lib/history/store';
import type { HistoryEntry } from '@/lib/history/types';
import { useI18n } from '@/lib/i18n';
import type { TranslationKey } from '@/lib/i18n';
import { clearActiveSession } from '@/lib/session/store';

function statusKey(status: HistoryEntry['status']): TranslationKey {
  if (status === 'Validée') return 'status.validated';
  if (status === 'Sans match') return 'status.noMatch';
  return 'status.expired';
}

export default function HistoryEntryScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { id } = useLocalSearchParams<{ id: string }>();
  const entryId = String(id ?? '');
  const [entry, setEntry] = useState<HistoryEntry | null>(
    entryId ? getHistoryEntry(entryId) : null,
  );

  const refresh = useCallback(async () => {
    await hydrateHistory();
    setEntry(entryId ? getHistoryEntry(entryId) : null);
  }, [entryId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => subscribeHistory(() => {
    setEntry(entryId ? getHistoryEntry(entryId) : null);
  }), [entryId]);

  if (!entry) {
    return (
      <Screen showBack title={t('historyEntry.title')}>
        <EmptyState
          title={t('historyEntry.notFoundTitle')}
          text={t('historyEntry.notFoundText')}
          actionLabel={t('historyEntry.notFoundAction')}
          onAction={() => router.replace('/(tabs)/history' as Href)}
          icon="history"
        />
      </Screen>
    );
  }

  const plan = getPlanById(entry.planId);
  const muted = entry.status !== 'Validée';
  const blurb = plan?.blurb;
  const statusText = t(statusKey(entry.status));
  const title = displayHistoryTitle(entry.title);

  const share = async () => {
    const message =
      entry.status === 'Validée'
        ? t('historyEntry.shareValidated', {
            title,
            duration: entry.durationMin
              ? t('historyEntry.shareValidatedDuration', { n: entry.durationMin })
              : '',
          })
        : t('historyEntry.shareOther', {
            title,
            status: statusText,
          });
    await Share.share({ message });
  };

  const relance = () => {
    void clearActiveSession().then(() => {
      router.replace('/session' as Href);
    });
  };

  const onDelete = () => {
    Alert.alert(t('historyEntry.removeAlertTitle'), t('historyEntry.removeAlertBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('historyEntry.removeAlertConfirm'),
        style: 'destructive',
        onPress: () => {
          void (async () => {
            await removeHistoryEntry(entry.id);
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            if (router.canGoBack()) router.back();
            else router.replace('/(tabs)/history' as Href);
          })();
        },
      },
    ]);
  };

  return (
    <Screen showBack title={t('historyEntry.title')}>
      <View style={[styles.hero, muted && styles.heroMuted]}>
        <Text style={styles.kicker}>{statusText}</Text>
        <Text style={styles.title}>{title}</Text>
        {blurb ? <Text style={styles.subtitle}>{blurb}</Text> : null}
        <Text style={styles.meta}>{formatHistoryMeta(entry)}</Text>
      </View>

      {entry.status === 'Sans match' ? (
        <View style={styles.tip}>
          <Text style={styles.tipTitle}>{t('historyEntry.tipTitle')}</Text>
          <Text style={styles.tipText}>{t('historyEntry.tipText')}</Text>
        </View>
      ) : null}

      <Pressable style={styles.primary} onPress={() => void share()}>
        <Text style={styles.primaryText}>{t('historyEntry.share')}</Text>
      </Pressable>
      <Pressable style={styles.secondary} onPress={relance}>
        <Text style={styles.secondaryText}>{t('historyEntry.relaunch')}</Text>
      </Pressable>
      <Pressable style={styles.ghost} onPress={onDelete}>
        <Text style={styles.ghostText}>{t('historyEntry.remove')}</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: FlipOn.dark,
    borderRadius: 22,
    padding: 20,
    gap: 8,
  },
  heroMuted: {
    backgroundColor: '#2A2E36',
  },
  kicker: {
    color: FlipOn.accent,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: { color: '#fff', fontSize: 26, fontWeight: '800', letterSpacing: -0.3 },
  subtitle: { color: '#C7CBD1', fontSize: 15, lineHeight: 22 },
  meta: { marginTop: 4, color: 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: '600' },
  tip: {
    backgroundColor: FlipOn.accentSoft,
    borderRadius: 16,
    padding: 14,
    gap: 4,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  tipTitle: { fontSize: 14, fontWeight: '800', color: FlipOn.accentInk },
  tipText: { fontSize: 13, lineHeight: 19, color: FlipOn.accentInk },
  primary: {
    minHeight: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FlipOn.accent,
  },
  primaryText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  secondary: {
    minHeight: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FlipOn.dark,
  },
  secondaryText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  ghost: {
    minHeight: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: FlipOn.dangerLine,
    backgroundColor: FlipOn.dangerSoft,
  },
  ghostText: { color: FlipOn.danger, fontSize: 14, fontWeight: '700' },
});
