import { Pressable, Text, View } from 'react-native';

import { SessionLine } from '@/components/session/ChipRow';
import { sessionStyles as styles } from '@/components/session/session-styles';
import { ErrorState } from '@/components/ui/ErrorState';
import { InviteQr } from '@/components/ui/InviteQr';
import { FlipOn } from '@/constants/flipon';
import { getInviteLink } from '@/lib/session/invite';
import type { SessionType } from '@/lib/session/types';

type Props = {
  type: SessionType;
  code: string;
  joinedCount: number;
  sessionPartySize: number;
  readyToVote: boolean;
  missing: number;
  loading: boolean;
  error: string | null;
  onShare: () => void;
  onLaunchVote: () => void;
};

/** Étape 2 : code, QR, attente participants, lancement vote. */
export function SessionLobby({
  type,
  code,
  joinedCount,
  sessionPartySize,
  readyToVote,
  missing,
  loading,
  error,
  onShare,
  onLaunchVote,
}: Props) {
  return (
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
        <SessionLine
          label="Type"
          value={type === 'Groupe' ? `Groupe · ${sessionPartySize}` : 'Duo'}
        />
        <SessionLine label="Code temporaire" value={code || '—'} />
        <SessionLine
          label="Participants"
          value={`${Math.min(joinedCount, sessionPartySize)}/${sessionPartySize}`}
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

        <Text style={styles.hint}>Les likes restent privés. Le code expire automatiquement.</Text>
        <Pressable style={styles.secondaryButton} onPress={onShare}>
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
        <ErrorState text={error} onRetry={onLaunchVote} loading={loading} />
      ) : (
        <Pressable
          style={[styles.primaryButton, !readyToVote && styles.primaryDisabled]}
          onPress={onLaunchVote}
          disabled={loading || !readyToVote}>
          <Text style={styles.primaryButtonText}>
            {loading
              ? 'Lancement…'
              : !readyToVote
                ? `En attente (${Math.min(joinedCount, sessionPartySize)}/${sessionPartySize})`
                : 'Lancer le vote'}
          </Text>
        </Pressable>
      )}
    </>
  );
}
