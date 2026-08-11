import { Pressable, Text, View } from 'react-native';

import { ChipRow } from '@/components/session/ChipRow';
import { sessionStyles as styles } from '@/components/session/session-styles';
import { ErrorState } from '@/components/ui/ErrorState';
import type { Constraints } from '@/data/plans';
import { useI18n } from '@/lib/i18n';
import type { SessionType } from '@/lib/session/types';

const TYPES: SessionType[] = ['Duo', 'Groupe'];
const GROUP_SIZES = [3, 4, 5, 6, 7, 8] as const;

type ContextBanner = {
  kind: 'ready' | 'missing';
  text: string;
} | null;

type Props = {
  type: SessionType;
  partySize: number;
  constraints: Constraints;
  /** Compteur catalogue (Basique). Masqué en Premium. */
  matchCount: number;
  showIdeaCount: boolean;
  loading: boolean;
  error: string | null;
  contextBanner?: ContextBanner;
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
  showIdeaCount,
  loading,
  error,
  contextBanner = null,
  onTypeChange,
  onPartySizeChange,
  onConstraintsPatch,
  onContinue,
}: Props) {
  const { t } = useI18n();
  const creatingLabel =
    loading && contextBanner?.kind === 'ready'
      ? t('sessionSetup.creatingAi')
      : loading
        ? t('sessionSetup.creating')
        : t('sessionSetup.continue');

  const blockedByCount = showIdeaCount && matchCount === 0;

  const durationOptions: { value: Constraints['duration']; label: string }[] = [
    { value: '30', label: t('sessionSetup.duration30') },
    { value: '60', label: t('sessionSetup.duration60') },
    { value: '120', label: t('sessionSetup.duration120') },
    { value: 'soirée', label: t('sessionSetup.durationEvening') },
  ];

  const budgetOptions: { value: Constraints['budget']; label: string }[] = [
    { value: '0', label: t('sessionSetup.budget0') },
    { value: '20', label: t('sessionSetup.budget20') },
    { value: '50', label: t('sessionSetup.budget50') },
    { value: '80+', label: t('sessionSetup.budget80') },
  ];

  const energyOptions: { value: Constraints['energy']; label: string }[] = [
    { value: 'basse', label: t('sessionSetup.energyLow') },
    { value: 'moyenne', label: t('sessionSetup.energyMid') },
    { value: 'haute', label: t('sessionSetup.energyHigh') },
  ];

  const placeOptions: { value: Constraints['place']; label: string }[] = [
    { value: 'dedans', label: t('sessionSetup.placeIn') },
    { value: 'dehors', label: t('sessionSetup.placeOut') },
    { value: 'peu-importe', label: t('sessionSetup.placeAny') },
  ];

  const vibeOptions: { value: Constraints['vibe']; label: string }[] = [
    { value: 'potes', label: t('sessionSetup.vibeFriends') },
    { value: 'date', label: t('sessionSetup.vibeDate') },
    { value: 'groupe', label: t('sessionSetup.vibeGroup') },
    { value: 'peu-importe', label: t('sessionSetup.vibeAny') },
  ];

  return (
    <>
      <View style={styles.hero}>
        <Text style={styles.kicker}>{t('sessionSetup.step1')}</Text>
        <Text style={styles.title}>{t('sessionSetup.title')}</Text>
        <Text style={styles.subtitle}>{t('sessionSetup.subtitle')}</Text>
      </View>

      {contextBanner ? (
        <View
          style={[
            styles.waitBox,
            contextBanner.kind === 'ready' ? styles.readyBox : null,
          ]}>
          <Text style={styles.waitTitle}>{t('sessionSetup.contextTitle')}</Text>
          <Text
            style={
              contextBanner.kind === 'ready' ? styles.readyText : styles.waitText
            }>
            {contextBanner.text}
          </Text>
        </View>
      ) : null}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('sessionSetup.type')}</Text>
        <ChipRow
          options={TYPES.map((value) => ({
            value,
            label: value === 'Groupe' ? t('sessionSetup.groupe') : t('sessionSetup.duo'),
          }))}
          value={type}
          onChange={onTypeChange}
        />
        {type === 'Groupe' ? (
          <>
            <Text style={styles.groupLabel}>{t('sessionSetup.partySize')}</Text>
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
          <Text style={styles.cardTitle}>{t('sessionSetup.frame')}</Text>
          {showIdeaCount ? (
            <Text style={styles.count}>{t('sessionSetup.ideasCount', { n: matchCount })}</Text>
          ) : null}
        </View>
        <Text style={styles.groupLabel}>{t('sessionSetup.duration')}</Text>
        <ChipRow
          options={durationOptions}
          value={constraints.duration}
          onChange={(duration) => onConstraintsPatch({ duration })}
        />
        <Text style={styles.groupLabel}>{t('sessionSetup.budget')}</Text>
        <ChipRow
          options={budgetOptions}
          value={constraints.budget}
          onChange={(budget) => onConstraintsPatch({ budget })}
        />
        <Text style={styles.groupLabel}>{t('sessionSetup.energy')}</Text>
        <ChipRow
          options={energyOptions}
          value={constraints.energy}
          onChange={(energy) => onConstraintsPatch({ energy })}
        />
        <Text style={styles.groupLabel}>{t('sessionSetup.place')}</Text>
        <ChipRow
          options={placeOptions}
          value={constraints.place}
          onChange={(place) => onConstraintsPatch({ place })}
        />
        <Text style={styles.groupLabel}>{t('sessionSetup.vibe')}</Text>
        <ChipRow
          options={vibeOptions}
          value={constraints.vibe}
          onChange={(vibe) => onConstraintsPatch({ vibe })}
        />
      </View>

      {error ? (
        <ErrorState text={error} onRetry={onContinue} loading={loading} />
      ) : (
        <Pressable
          style={[styles.primaryButton, (blockedByCount || loading) && styles.primaryDisabled]}
          onPress={onContinue}
          disabled={blockedByCount || loading}>
          <Text style={styles.primaryButtonText}>{creatingLabel}</Text>
        </Pressable>
      )}
    </>
  );
}
