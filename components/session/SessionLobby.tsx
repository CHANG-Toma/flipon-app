import { Pressable, Text, View } from 'react-native';

import { SessionLine } from '@/components/session/ChipRow';
import { sessionStyles as styles } from '@/components/session/session-styles';
import { ErrorState } from '@/components/ui/ErrorState';
import { InviteQr } from '@/components/ui/InviteQr';
import { FlipOn } from '@/constants/flipon';
import { useI18n } from '@/lib/i18n';
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
  const { t } = useI18n();
  const joined = Math.min(joinedCount, sessionPartySize);

  return (
    <>
      <View style={styles.hero}>
        <Text style={styles.kicker}>{t('sessionLobby.step2')}</Text>
        <Text style={styles.title}>{t('sessionLobby.title')}</Text>
        <Text style={styles.subtitle}>{t('sessionLobby.subtitle')}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('sessionLobby.invite')}</Text>
        <SessionLine
          label={t('session.typeLabel')}
          value={
            type === 'Groupe'
              ? t('session.typeGroup', { size: sessionPartySize })
              : t('session.typeDuo')
          }
        />
        <SessionLine label={t('session.codeLabel')} value={code || '—'} />
        <SessionLine
          label={t('session.participantsLabel')}
          value={t('session.participants', { joined, size: sessionPartySize })}
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
            <Text style={styles.qrHint}>{t('sessionLobby.qrHint')}</Text>
          </View>
        ) : null}

        <Text style={styles.hint}>{t('sessionLobby.likesPrivate')}</Text>
        <Pressable style={styles.secondaryButton} onPress={onShare}>
          <Text style={styles.secondaryButtonText}>{t('sessionLobby.share')}</Text>
        </Pressable>
        {!readyToVote ? (
          <View style={styles.waitBox}>
            <Text style={styles.waitTitle}>
              {type === 'Groupe' ? t('sessionLobby.waitGroup') : t('sessionLobby.waitPartner')}
            </Text>
            <Text style={styles.waitText}>
              {missing <= 1 ? t('session.waitOne') : t('session.waitMany', { n: missing })}
            </Text>
          </View>
        ) : (
          <View style={styles.readyBox}>
            <Text style={styles.readyText}>{t('sessionLobby.ready')}</Text>
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
              ? t('sessionLobby.launching')
              : !readyToVote
                ? t('sessionLobby.waitingBtn', { joined, size: sessionPartySize })
                : t('sessionLobby.launchVote')}
          </Text>
        </Pressable>
      )}
    </>
  );
}
