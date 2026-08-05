import { useEffect, useMemo, useState } from 'react';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { Screen } from '@/components/ui/Screen';
import { ErrorState } from '@/components/ui/ErrorState';
import { InviteQr } from '@/components/ui/InviteQr';
import { FlipOn } from '@/constants/flipon';
import { countMatchingPlans, type Constraints } from '@/data/plans';
import { useMounted } from '@/hooks/use-mounted';
import { usePolling } from '@/hooks/use-polling';
import {
  SessionType,
  ApiError,
  NetworkError,
  canStartVoting,
  createSessionOnServer,
  defaultPartySize,
  getInviteLink,
  getSession,
  refreshSession,
  startVoting,
  subscribeSession,
} from '@/lib/session-store';

const TYPES: SessionType[] = ['Duo', 'Groupe'];
const GROUP_SIZES = [3, 4, 5, 6, 7, 8] as const;

const DURATION_OPTIONS: { value: Constraints['duration']; label: string }[] = [
  { value: '30', label: '30 min' },
  { value: '60', label: '1h' },
  { value: '120', label: '2h' },
  { value: 'soirée', label: 'Soirée' },
];

const BUDGET_OPTIONS: { value: Constraints['budget']; label: string }[] = [
  { value: '0', label: '0 EUR' },
  { value: '20', label: '≤ 20' },
  { value: '50', label: '≤ 50' },
  { value: '80+', label: '80+' },
];

const ENERGY_OPTIONS: { value: Constraints['energy']; label: string }[] = [
  { value: 'basse', label: 'Calme' },
  { value: 'moyenne', label: 'Mixte' },
  { value: 'haute', label: 'Dynamique' },
];

const PLACE_OPTIONS: { value: Constraints['place']; label: string }[] = [
  { value: 'dedans', label: 'Dedans' },
  { value: 'dehors', label: 'Dehors' },
  { value: 'peu-importe', label: 'Peu importe' },
];

const VIBE_OPTIONS: { value: Constraints['vibe']; label: string }[] = [
  { value: 'potes', label: 'Potes' },
  { value: 'date', label: 'Date' },
  { value: 'groupe', label: 'Groupe' },
  { value: 'peu-importe', label: 'Tous' },
];

type Step = 'setup' | 'invite';

export default function SessionScreen() {
  const router = useRouter();
  const isMounted = useMounted();
  const existing = getSession();
  const [step, setStep] = useState<Step>(
    existing.status === 'lobby' && existing.code ? 'invite' : 'setup',
  );
  const [type, setType] = useState<SessionType>(
    existing.type === 'Groupe' ? 'Groupe' : 'Duo',
  );
  const [partySize, setPartySize] = useState(
    existing.partySize || defaultPartySize(existing.type === 'Groupe' ? 'Groupe' : 'Duo'),
  );
  const [constraints, setConstraints] = useState<Constraints>(existing.constraints);
  const [code, setCode] = useState(existing.code);
  const [joinedCount, setJoinedCount] = useState(existing.joinedCount);
  const [sessionPartySize, setSessionPartySize] = useState(existing.partySize || 2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(
    () =>
      subscribeSession(() => {
        const session = getSession();
        setCode(session.code);
        setJoinedCount(session.joinedCount);
        setSessionPartySize(session.partySize);
      }),
    [],
  );

  usePolling(() => refreshSession().then(() => undefined).catch(() => undefined), {
    enabled: step === 'invite' && Boolean(code),
    intervalMs: 2000,
  });

  const matchCount = useMemo(() => countMatchingPlans(constraints), [constraints]);
  // API duo : prêt dès qu’un invité a rejoint (joinedCount >= 2).
  const readyToVote = canStartVoting();
  const missing = Math.max(0, 2 - joinedCount);

  const onTypeChange = (next: SessionType) => {
    setType(next);
    setPartySize(defaultPartySize(next));
  };

  const patchConstraints = (patch: Partial<Constraints>) => {
    const next = { ...constraints, ...patch };
    setConstraints(next);
  };

  const goToInvite = async () => {
    if (loading || matchCount === 0) {
      if (matchCount === 0) setError('Aucun plan pour ce cadre. Élargis un critère.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const size = type === 'Duo' ? 2 : partySize;
      const session = await createSessionOnServer(type, constraints, size);
      if (!isMounted()) return;
      setCode(session.code);
      setJoinedCount(session.joinedCount);
      setSessionPartySize(session.partySize);
      setStep('invite');
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {
      if (!isMounted()) return;
      setError(
        e instanceof NetworkError || e instanceof ApiError || e instanceof Error
          ? e.message
          : 'Impossible de créer la session.',
      );
    } finally {
      if (isMounted()) setLoading(false);
    }
  };

  const launchVote = async () => {
    if (loading) return;
    if (!canStartVoting()) {
      setError('Attends que quelqu’un rejoigne la session.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await startVoting();
      if (!isMounted()) return;
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push('/vote');
    } catch (e) {
      if (!isMounted()) return;
      setError(
        e instanceof NetworkError || e instanceof ApiError || e instanceof Error
          ? e.message
          : 'Impossible de lancer la session.',
      );
    } finally {
      if (isMounted()) setLoading(false);
    }
  };

  const shareInvite = async () => {
    if (!code) return;
    await Share.share({
      message: `Rejoins ma session FlipOn : ${code}\n${getInviteLink(code)}`,
    });
  };

  const handleBack = () => {
    if (step === 'invite') {
      setStep('setup');
      setError(null);
      return;
    }
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)');
  };

  return (
    <Screen
      showBack
      onBack={handleBack}
      title={step === 'setup' ? 'Nouvelle session' : 'Invitation'}>
      {step === 'setup' ? (
        <>
          <View style={styles.hero}>
            <Text style={styles.kicker}>Étape 1</Text>
            <Text style={styles.title}>Type et cadre</Text>
            <Text style={styles.subtitle}>
              Choisis le format, puis le cadre. L’invitation vient ensuite.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Type</Text>
            <ChipRow
              options={TYPES.map((t) => ({ value: t, label: t }))}
              value={type}
              onChange={onTypeChange}
            />
            {type === 'Groupe' ? (
              <>
                <Text style={styles.groupLabel}>Nombre de personnes</Text>
                <ChipRow
                  options={GROUP_SIZES.map((n) => ({
                    value: String(n),
                    label: `${n}`,
                  }))}
                  value={String(partySize)}
                  onChange={(value) => setPartySize(Number(value))}
                />
              </>
            ) : null}
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Cadre</Text>
              <Text style={styles.count}>{matchCount} idées</Text>
            </View>
            <Text style={styles.groupLabel}>Durée</Text>
            <ChipRow
              options={DURATION_OPTIONS}
              value={constraints.duration}
              onChange={(duration) => patchConstraints({ duration })}
            />
            <Text style={styles.groupLabel}>Budget</Text>
            <ChipRow
              options={BUDGET_OPTIONS}
              value={constraints.budget}
              onChange={(budget) => patchConstraints({ budget })}
            />
            <Text style={styles.groupLabel}>Énergie</Text>
            <ChipRow
              options={ENERGY_OPTIONS}
              value={constraints.energy}
              onChange={(energy) => patchConstraints({ energy })}
            />
            <Text style={styles.groupLabel}>Lieu</Text>
            <ChipRow
              options={PLACE_OPTIONS}
              value={constraints.place}
              onChange={(place) => patchConstraints({ place })}
            />
            <Text style={styles.groupLabel}>Ambiance</Text>
            <ChipRow
              options={VIBE_OPTIONS}
              value={constraints.vibe}
              onChange={(vibe) => patchConstraints({ vibe })}
            />
          </View>

          {error ? (
            <ErrorState text={error} onRetry={goToInvite} loading={loading} />
          ) : (
            <Pressable
              style={[styles.primaryButton, (matchCount === 0 || loading) && styles.primaryDisabled]}
              onPress={goToInvite}
              disabled={matchCount === 0 || loading}>
              <Text style={styles.primaryButtonText}>
                {loading ? 'Création…' : 'Continuer vers l’invitation'}
              </Text>
            </Pressable>
          )}
        </>
      ) : (
        <>
          <View style={styles.hero}>
            <Text style={styles.kicker}>Étape 2</Text>
            <Text style={styles.title}>Invite et attends</Text>
            <Text style={styles.subtitle}>
              Partage le code. Le vote démarre quand tout le monde a rejoint.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Invitation</Text>
            <Line label="Type" value={type === 'Groupe' ? `Groupe · ${sessionPartySize}` : 'Duo'} />
            <Line label="Code temporaire" value={code || '—'} />
            <Line
              label="Participants"
              value={`${Math.min(joinedCount, 2)}/2`}
              last
            />

            {code ? (
              <View style={styles.qrBlock}>
                <View style={styles.qrFrame}>
                  <InviteQr
                    value={getInviteLink(code)}
                    size={168}
                    color={FlipOn.ink}
                    backgroundColor={FlipOn.surface}
                  />
                </View>
                <Text style={styles.qrHint}>Scanne pour ouvrir FlipOn (app ou site)</Text>
              </View>
            ) : null}

            <Text style={styles.hint}>
              Les likes restent privés. Le code expire automatiquement.
            </Text>
            <Pressable style={styles.secondaryButton} onPress={shareInvite}>
              <Text style={styles.secondaryButtonText}>Partager le lien</Text>
            </Pressable>
            {!readyToVote ? (
              <View style={styles.waitBox}>
                <Text style={styles.waitTitle}>
                  {type === 'Groupe' ? 'En attente du groupe' : 'En attente du partenaire'}
                </Text>
                <Text style={styles.waitText}>
                  {missing <= 1
                    ? 'Encore 1 personne à rejoindre.'
                    : `Encore ${missing} personnes à rejoindre.`}
                </Text>
              </View>
            ) : (
              <View style={styles.readyBox}>
                <Text style={styles.readyText}>Tout le monde est là. Tu peux lancer le vote.</Text>
              </View>
            )}
          </View>

          {error ? (
            <ErrorState text={error} onRetry={launchVote} loading={loading} />
          ) : (
            <Pressable
              style={[styles.primaryButton, !readyToVote && styles.primaryDisabled]}
              onPress={launchVote}
              disabled={loading || !readyToVote}>
              <Text style={styles.primaryButtonText}>
                {loading
                  ? 'Lancement…'
                  : !readyToVote
                    ? `En attente (${Math.min(joinedCount, 2)}/2)`
                    : 'Lancer le vote'}
              </Text>
            </Pressable>
          )}
        </>
      )}
    </Screen>
  );
}

function ChipRow<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <View style={styles.chipRow}>
      {options.map((item) => {
        const selected = item.value === value;
        return (
          <Pressable
            key={item.value}
            onPress={() => onChange(item.value)}
            style={[styles.chip, selected && styles.chipSelected]}>
            <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function Line({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.line, !last && styles.lineBorder]}>
      <Text style={styles.lineLabel}>{label}</Text>
      <Text style={styles.lineValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: FlipOn.dark,
    borderRadius: 22,
    padding: 18,
    gap: 8,
  },
  kicker: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    color: FlipOn.accent,
  },
  title: { fontSize: 26, fontWeight: '800', color: '#fff', lineHeight: 32 },
  subtitle: { fontSize: 14, lineHeight: 20, color: '#C7CBD1' },
  card: {
    backgroundColor: FlipOn.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: FlipOn.line,
    padding: 16,
    gap: 10,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '700', color: FlipOn.ink },
  count: { fontSize: 13, fontWeight: '700', color: FlipOn.accentInk },
  groupLabel: { fontSize: 12, fontWeight: '600', color: FlipOn.muted, marginTop: 4 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    minHeight: 36,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: FlipOn.line,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FlipOn.surface,
  },
  chipSelected: { borderColor: FlipOn.accent, backgroundColor: FlipOn.accentSoft },
  chipText: { fontSize: 13, fontWeight: '600', color: FlipOn.muted },
  chipTextSelected: { color: FlipOn.accentInk },
  line: { paddingVertical: 10, gap: 2 },
  lineBorder: { borderBottomWidth: 1, borderBottomColor: FlipOn.soft },
  lineLabel: { fontSize: 12, color: FlipOn.muted },
  lineValue: { fontSize: 15, fontWeight: '600', color: FlipOn.ink },
  qrBlock: { alignItems: 'center', gap: 10, paddingVertical: 6 },
  qrFrame: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: FlipOn.line,
    backgroundColor: FlipOn.surface,
  },
  qrHint: { fontSize: 13, fontWeight: '600', color: FlipOn.muted },
  hint: { fontSize: 12, lineHeight: 18, color: FlipOn.muted },
  waitBox: {
    borderRadius: 12,
    backgroundColor: FlipOn.soft,
    padding: 12,
    gap: 4,
  },
  waitTitle: { fontSize: 14, fontWeight: '700', color: FlipOn.ink },
  waitText: { fontSize: 13, lineHeight: 18, color: FlipOn.muted },
  readyBox: {
    borderRadius: 12,
    backgroundColor: FlipOn.successSoft,
    padding: 12,
  },
  readyText: { fontSize: 13, fontWeight: '700', color: FlipOn.success },
  secondaryButton: {
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: FlipOn.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: { fontSize: 14, fontWeight: '700', color: FlipOn.ink },
  primaryButton: {
    minHeight: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FlipOn.accent,
  },
  primaryDisabled: { opacity: 0.45 },
  primaryButtonText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
