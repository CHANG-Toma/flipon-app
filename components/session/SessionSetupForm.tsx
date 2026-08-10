import { Pressable, Text, View } from 'react-native';

import { ChipRow } from '@/components/session/ChipRow';
import { sessionStyles as styles } from '@/components/session/session-styles';
import { ErrorState } from '@/components/ui/ErrorState';
import type { Constraints } from '@/data/plans';
import type { SessionType } from '@/lib/session/types';

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

type Props = {
  type: SessionType;
  partySize: number;
  constraints: Constraints;
  matchCount: number;
  loading: boolean;
  error: string | null;
  onTypeChange: (type: SessionType) => void;
  onPartySizeChange: (size: number) => void;
  onConstraintsPatch: (patch: Partial<Constraints>) => void;
  onContinue: () => void;
};

/** Étape 1 : type + cadre de session. */
export function SessionSetupForm({
  type,
  partySize,
  constraints,
  matchCount,
  loading,
  error,
  onTypeChange,
  onPartySizeChange,
  onConstraintsPatch,
  onContinue,
}: Props) {
  return (
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
              onChange={(value) => onPartySizeChange(Number(value))}
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
          onChange={(duration) => onConstraintsPatch({ duration })}
        />
        <Text style={styles.groupLabel}>Budget</Text>
        <ChipRow
          options={BUDGET_OPTIONS}
          value={constraints.budget}
          onChange={(budget) => onConstraintsPatch({ budget })}
        />
        <Text style={styles.groupLabel}>Énergie</Text>
        <ChipRow
          options={ENERGY_OPTIONS}
          value={constraints.energy}
          onChange={(energy) => onConstraintsPatch({ energy })}
        />
        <Text style={styles.groupLabel}>Lieu</Text>
        <ChipRow
          options={PLACE_OPTIONS}
          value={constraints.place}
          onChange={(place) => onConstraintsPatch({ place })}
        />
        <Text style={styles.groupLabel}>Ambiance</Text>
        <ChipRow
          options={VIBE_OPTIONS}
          value={constraints.vibe}
          onChange={(vibe) => onConstraintsPatch({ vibe })}
        />
      </View>

      {error ? (
        <ErrorState text={error} onRetry={onContinue} loading={loading} />
      ) : (
        <Pressable
          style={[styles.primaryButton, (matchCount === 0 || loading) && styles.primaryDisabled]}
          onPress={onContinue}
          disabled={matchCount === 0 || loading}>
          <Text style={styles.primaryButtonText}>
            {loading ? 'Création…' : 'Continuer vers l’invitation'}
          </Text>
        </Pressable>
      )}
    </>
  );
}
