/**
 * Accueil — orchestration (état + composition des blocs UI).
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFocusEffect, useRouter, type Href } from 'expo-router';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '@clerk/clerk-expo';
import * as Haptics from 'expo-haptics';

import { HomeActiveSession } from '@/components/home/HomeActiveSession';
import { HomeCarousel } from '@/components/home/HomeCarousel';
import { HomeLatestActivity } from '@/components/home/HomeLatestActivity';
import { HomePremiumContext } from '@/components/home/HomePremiumContext';
import { homeStyles as styles } from '@/components/home/home-styles';
import { useSubscription } from '@/hooks/use-subscription';
import {
  getLatestHistory,
  hydrateHistory,
  subscribeHistory,
} from '@/lib/history/store';
import type { HistoryEntry } from '@/lib/history/types';
import { isValidSessionCode, normalizeSessionCode } from '@/lib/session-code';
import { isActiveSession } from '@/lib/session/selectors';
import {
  getSession,
  hydrateSession,
  subscribeSession,
} from '@/lib/session/store';
import { useI18n } from '@/lib/i18n';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useUser();
  const { t } = useI18n();
  const { isPremium } = useSubscription();
  const [joinCode, setJoinCode] = useState('');
  const [session, setSession] = useState(getSession());
  const [latest, setLatest] = useState<HistoryEntry | null>(getLatestHistory());
  const [ready, setReady] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  const refreshLocal = useCallback(async () => {
    await Promise.all([hydrateSession(), hydrateHistory()]);
    setSession(getSession());
    setLatest(getLatestHistory());
    setReady(true);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refreshLocal();
    }, [refreshLocal]),
  );

  useEffect(() => subscribeSession(() => setSession(getSession())), []);
  useEffect(() => subscribeHistory(() => setLatest(getLatestHistory())), []);

  const hello = useMemo(() => {
    const hour = new Date().getHours();
    const base = hour < 18 ? t('home.hello') : t('home.helloEvening');
    const name = (user?.firstName ?? user?.username)?.trim();
    return name ? `${base}, ${name}` : base;
  }, [t, user?.firstName, user?.username]);

  const joinSession = () => {
    const code = normalizeSessionCode(joinCode);
    if (!isValidSessionCode(code)) {
      setJoinError(t('home.joinInvalid'));
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    setJoinError(null);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/join/${code}` as Href);
  };

  const onSessionClosed = () => {
    setSession(getSession());
    const isDone = session.status === 'done';
    if (isDone) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const hasActive = isActiveSession(session);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={8}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.hello}>{hello}</Text>
          </View>

          <View style={styles.cards}>
            {hasActive ? (
              <HomeActiveSession session={session} onClosed={onSessionClosed} />
            ) : ready ? (
              <HomeCarousel
                joinCode={joinCode}
                joinError={joinError}
                isPremium={isPremium}
                onChangeCode={(code) => {
                  setJoinCode(code);
                  setJoinError(null);
                }}
                onJoin={joinSession}
              />
            ) : null}
          </View>

          <HomePremiumContext enabled={isPremium} />

          <HomeLatestActivity latest={latest} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
