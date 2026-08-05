import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { EmptyState } from '@/components/ui/EmptyState';
import { FlipOn } from '@/constants/flipon';
import {
  formatHistoryMeta,
  getLatestHistory,
  hydrateHistory,
  subscribeHistory,
  type HistoryEntry,
} from '@/lib/history-store';
import { isValidSessionCode, normalizeSessionCode } from '@/lib/session-code';
import {
  getHomeCta,
  getSession,
  hydrateSession,
  isActiveSession,
  subscribeSession,
} from '@/lib/session-store';

export default function HomeScreen() {
  const router = useRouter();
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

  const joinSession = () => {
    const code = normalizeSessionCode(joinCode);
    if (!isValidSessionCode(code)) {
      setJoinError('Entre un code à 4 caractères.');
      return;
    }
    setJoinError(null);
    router.push(`/join/${code}`);
  };

  const hasActive = isActiveSession(session);
  const home = getHomeCta(session);
  const progressPct = Math.max(
    10,
    (Math.min(session.index, session.deck.length) / Math.max(session.deck.length, 1)) * 100,
  );

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
            <Text style={styles.hello}>Bonjour</Text>
            <Text style={styles.title}>Que fait-on ?</Text>
            <Text style={styles.subtitle}>
              Où tu veux, quand tu veux : une idée claire pour tous.
            </Text>
          </View>

          {hasActive ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${home.cta}. ${home.title}`}
              style={styles.hero}
              onPress={() => router.push(home.target)}>
              <View style={styles.heroTop}>
                <View style={styles.badgeLive}>
                  <View style={styles.dot} />
                  <Text style={styles.badgeLiveText}>En cours</Text>
                </View>
                <Text style={styles.heroExpire}>{session.code}</Text>
              </View>

              <Text style={styles.heroTitle}>
                {session.type} · {home.title}
              </Text>
              <Text style={styles.heroText}>{home.detail}</Text>

              {session.status === 'voting' || session.status === 'waiting_partner' ? (
                <View style={styles.progressBlock}>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
                  </View>
                  <Text style={styles.progressLabel}>
                    {Math.min(session.index, session.deck.length)}/{session.deck.length || 6} idées
                    vues
                  </Text>
                </View>
              ) : null}

              <View style={styles.heroCta}>
                <Text style={styles.heroCtaText}>{home.cta}</Text>
                <MaterialIcons name="arrow-forward" size={18} color="#fff" />
              </View>
            </Pressable>
          ) : ready ? (
            <EmptyState
              title="Aucune session en cours"
              text="Lance une session ou rejoins un ami avec un code."
              actionLabel="Nouvelle session"
              onAction={() => router.push('/session')}
              icon="add-circle-outline"
            />
          ) : null}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rejoindre</Text>
            <View style={styles.joinRow}>
              <TextInput
                value={joinCode}
                onChangeText={(value) => {
                  setJoinCode(normalizeSessionCode(value));
                  setJoinError(null);
                }}
                placeholder="Code session"
                placeholderTextColor={FlipOn.muted}
                autoCapitalize="characters"
                autoCorrect={false}
                autoComplete="off"
                textContentType="oneTimeCode"
                maxLength={4}
                returnKeyType="go"
                onSubmitEditing={joinSession}
                accessibilityLabel="Code de session"
                style={styles.input}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Rejoindre la session"
                style={[styles.joinButton, !joinCode.trim() && styles.joinButtonDisabled]}
                onPress={joinSession}
                disabled={!joinCode.trim()}>
                <Text style={styles.joinButtonText}>OK</Text>
              </Pressable>
            </View>
            {joinError ? <Text style={styles.joinError}>{joinError}</Text> : null}
            <Text style={styles.hint}>Code temporaire · aucun vote exposé</Text>
          </View>

          {latest ? (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Dernière activité</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Voir tout l’historique"
                  onPress={() => router.push('/(tabs)/history')}
                  hitSlop={8}>
                  <Text style={styles.sectionLink}>Voir tout</Text>
                </Pressable>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Dernière activité ${latest.title}`}
                style={styles.row}
                onPress={() => router.push('/(tabs)/history')}>
                <View style={styles.rowBody}>
                  <Text style={styles.rowTitle}>{latest.title}</Text>
                  <Text style={styles.rowMeta}>{formatHistoryMeta(latest)}</Text>
                </View>
                <Text
                  style={[
                    styles.rowStatus,
                    latest.status === 'Validée' ? styles.rowStatusOk : styles.rowStatusMuted,
                  ]}>
                  {latest.status}
                </Text>
                <MaterialIcons name="chevron-right" size={22} color={FlipOn.muted} />
              </Pressable>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: FlipOn.bg },
  flex: { flex: 1 },
  scroll: { flex: 1 },
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 110,
    gap: 20,
  },
  top: { gap: 2 },
  hello: { fontSize: 14, fontWeight: '600', color: FlipOn.muted },
  title: { fontSize: 32, fontWeight: '800', color: FlipOn.ink, letterSpacing: -0.6 },
  subtitle: { marginTop: 4, fontSize: 15, lineHeight: 22, color: FlipOn.muted },
  hero: { backgroundColor: FlipOn.dark, borderRadius: 24, padding: 18, gap: 10 },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badgeLive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: FlipOn.accent },
  badgeLiveText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  heroExpire: { color: '#A8ADB5', fontSize: 12, fontWeight: '700', letterSpacing: 0.4 },
  heroTitle: { color: '#fff', fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
  heroText: { color: '#C7CBD1', fontSize: 14, lineHeight: 20 },
  progressBlock: { gap: 6, marginTop: 2 },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.14)',
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 999, backgroundColor: FlipOn.accent },
  progressLabel: { color: '#A8ADB5', fontSize: 12, fontWeight: '600' },
  heroCta: {
    marginTop: 6,
    minHeight: 46,
    borderRadius: 14,
    backgroundColor: FlipOn.accent,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  heroCtaText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  section: { gap: 10 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: FlipOn.muted },
  sectionLink: { fontSize: 13, fontWeight: '700', color: FlipOn.accent },
  joinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: FlipOn.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: FlipOn.line,
    padding: 8,
  },
  input: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 15,
    fontWeight: '600',
    color: FlipOn.ink,
    letterSpacing: 0.4,
  },
  joinButton: {
    minHeight: 44,
    minWidth: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FlipOn.dark,
    paddingHorizontal: 14,
  },
  joinButtonDisabled: { opacity: 0.35 },
  joinButtonText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  joinError: { fontSize: 13, color: FlipOn.danger, fontWeight: '600' },
  hint: { fontSize: 12, lineHeight: 17, color: FlipOn.muted },
  row: {
    backgroundColor: FlipOn.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: FlipOn.line,
    paddingVertical: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rowBody: { flex: 1, gap: 3 },
  rowTitle: { fontSize: 16, fontWeight: '700', color: FlipOn.ink },
  rowMeta: { fontSize: 13, color: FlipOn.muted },
  rowStatus: {
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    overflow: 'hidden',
  },
  rowStatusOk: { color: FlipOn.success, backgroundColor: FlipOn.successSoft },
  rowStatusMuted: { color: FlipOn.muted, backgroundColor: FlipOn.soft },
});
