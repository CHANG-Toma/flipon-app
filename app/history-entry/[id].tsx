/**
 * Détail d'une entrée d'historique
 * --------------------------------
 * Idée retenue (Basique : pas d'étapes), partage, relancer, supprimer local.
 */
import { useEffect } from 'react';
import { Alert, Pressable, Share, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { Screen } from '@/components/ui/Screen';
import { EmptyState } from '@/components/ui/EmptyState';
import { flowStyles } from '@/components/ui/flow-styles';
import { getPlanById } from '@/data/plans';
import { useHistoryEntry } from '@/hooks/use-history';
import { displayHistoryTitle, formatHistoryMeta } from '@/lib/history/format';
import { hydrateHistory, removeHistoryEntry } from '@/lib/history/store';
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
  const entry = useHistoryEntry(entryId || undefined);

  useEffect(() => {
    void hydrateHistory();
  }, [entryId]);

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
      <View style={[flowStyles.hero, muted && flowStyles.heroMuted]}>
        <Text style={flowStyles.kicker}>{statusText}</Text>
        <Text style={flowStyles.heroTitle}>{title}</Text>
        {blurb ? <Text style={flowStyles.heroSubtitle}>{blurb}</Text> : null}
        <Text style={flowStyles.heroMeta}>{formatHistoryMeta(entry)}</Text>
      </View>

      {entry.status === 'Sans match' ? (
        <View style={flowStyles.tipCard}>
          <Text style={flowStyles.tipTitle}>{t('historyEntry.tipTitle')}</Text>
          <Text style={flowStyles.tipText}>{t('historyEntry.tipText')}</Text>
        </View>
      ) : null}

      <Pressable style={flowStyles.primaryButton} onPress={() => void share()}>
        <Text style={flowStyles.primaryText}>{t('historyEntry.share')}</Text>
      </Pressable>
      <Pressable style={flowStyles.secondaryButton} onPress={relance}>
        <Text style={flowStyles.secondaryText}>{t('historyEntry.relaunch')}</Text>
      </Pressable>
      <Pressable style={flowStyles.dangerButton} onPress={onDelete}>
        <Text style={flowStyles.dangerText}>{t('historyEntry.remove')}</Text>
      </Pressable>
    </Screen>
  );
}
