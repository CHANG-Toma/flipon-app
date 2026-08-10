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
import { HomeJoinCode } from '@/components/home/HomeJoinCode';
import { HomeLatestActivity } from '@/components/home/HomeLatestActivity';
import { HomeStartCard } from '@/components/home/HomeStartCard';
import { homeStyles as styles } from '@/components/home/home-styles';
import {
  getLatestHistory,
  hydrateHistory,
  subscribeHistory,
} from '@/lib/history/store';
import type { HistoryEntry } from '@/lib/history/types';
import { isValidSessionCode, normalizeSessionCode } from '@/lib/session-code';
import { isActiveSession } from '@/lib/session/selectors';
import {
  clearActiveSession,
  getSession,
  hydrateSession,
  subscribeSession,
} from '@/lib/session/store';

function greetingLabel(firstName?: string | null) {
  const hour = new Date().getHours();
  const hello = hour < 18 ? 'Bonjour' : 'Bonsoir';
  const name = firstName?.trim();
  return name ? `${hello}, ${name}` : hello;
}

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [joinCode, setJoinCode] = useState('');
  const [session, setSession] = useState(getSession());
  const [latest, setLatest] = useState<HistoryEntry | null>(getLatestHistory());
  const [ready, setReady] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);

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

  const hello = useMemo(
    () => greetingLabel(user?.firstName ?? user?.username),
    [user?.firstName, user?.username],
  );

  const joinSession = () => {
    const code = normalizeSessionCode(joinCode);
    if (!isValidSessionCode(code)) {
      setJoinError('Entre un code à 4 caractères.');
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    setJoinError(null);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/join/${code}` as Href);
  };

  const dismissDoneSession = async () => {
    if (clearing) return;
    try {
      setClearing(true);
      await clearActiveSession();
      setSession(getSession());
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } finally {
      setClearing(false);
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
          <View style={styles.top}>
            <Text style={styles.hello}>{hello}</Text>
            <Text style={styles.title}>Que fait-on ?</Text>
            <Text style={styles.subtitle}>
              Votez en privé, une idée pour tout le monde. Ambiance d’idées — pas une app de
              rencontres.
            </Text>
          </View>

          {hasActive ? (
            <HomeActiveSession
              session={session}
              clearing={clearing}
              onDismiss={() => void dismissDoneSession()}
            />
          ) : ready ? (
            <HomeStartCard />
          ) : null}

          <HomeJoinCode
            joinCode={joinCode}
            joinError={joinError}
            onChangeCode={(code) => {
              setJoinCode(code);
              setJoinError(null);
            }}
            onJoin={joinSession}
          />

          <HomeLatestActivity latest={latest} showTip={ready && !hasActive} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
