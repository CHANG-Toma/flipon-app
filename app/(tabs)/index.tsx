/**
 * Accueil — orchestration (état + composition des blocs UI).
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFocusEffect, useRouter, type Href } from 'expo-router';
import {
  KeyboardAvoidingView,
  Platform,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '@clerk/clerk-expo';
import * as Haptics from 'expo-haptics';

import { HomeActiveSession } from '@/components/home/HomeActiveSession';
import { HomeCarousel } from '@/components/home/HomeCarousel';
import { HomePremiumContext } from '@/components/home/HomePremiumContext';
import { homeStyles as styles } from '@/components/home/home-styles';
import { useSubscription } from '@/hooks/use-subscription';
import { isValidSessionCode, normalizeSessionCode } from '@/lib/session-code';
import { isActiveSession } from '@/lib/session/selectors';
import {
  getSession,
  hydrateSession,
  subscribeSession,
} from '@/lib/session/store';
import { useI18n, type TranslationKey } from '@/lib/i18n';
import { momentOfDayKey } from '@/lib/premium/context';

const HELLO_KEYS: Record<ReturnType<typeof momentOfDayKey>, TranslationKey> = {
  morning: 'home.hello',
  afternoon: 'home.helloAfternoon',
  evening: 'home.helloEvening',
  night: 'home.helloNight',
};

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useUser();
  const { t } = useI18n();
  const { isPremium } = useSubscription();
  const [joinCode, setJoinCode] = useState('');
  const [session, setSession] = useState(getSession());
  const [ready, setReady] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  const refreshLocal = useCallback(async () => {
    await hydrateSession();
    setSession(getSession());
    setReady(true);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refreshLocal();
    }, [refreshLocal]),
  );

  useEffect(() => subscribeSession(() => setSession(getSession())), []);

  const hello = useMemo(() => {
    const base = t(HELLO_KEYS[momentOfDayKey()]);
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
        <View style={styles.screen}>
          <View style={styles.headerBlock}>
            <HomePremiumContext hello={hello} isPremium={isPremium} />
          </View>

          <View style={styles.cards}>
            {hasActive ? (
              <View style={styles.headerBlock}>
                <HomeActiveSession session={session} onClosed={onSessionClosed} />
              </View>
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
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
