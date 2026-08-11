import { Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';

import { Screen } from '@/components/ui/Screen';
import { EmptyState } from '@/components/ui/EmptyState';
import { FlipOn } from '@/constants/flipon';
import { useSubscription } from '@/hooks/use-subscription';
import { useI18n } from '@/lib/i18n';
import { buildResultRoadmap, groupRoadmapByPhase } from '@/lib/premium/roadmap';
import { clearActiveSession, getSession } from '@/lib/session/store';

/**
 * Résultat Basique / Premium
 * --------------------------
 * Basique : idée matchée + teaser Premium.
 * Premium : feuille de route (roadmap) détaillée.
 */
export default function ResultScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { isPremium } = useSubscription();
  const session = getSession();
  const result = session.result;

  if (session.status !== 'done' && !result) {
    return (
      <Screen showBack title={t('result.title')}>
        <EmptyState
          title={t('result.emptyTitle')}
          text={t('result.emptyText')}
          actionLabel={t('result.emptyAction')}
          onAction={() => router.replace('/vote')}
          icon="emoji-events"
        />
      </Screen>
    );
  }

  if (!result) {
    return (
      <Screen showBack title={t('result.title')}>
        <EmptyState
          title={t('result.noMatchTitle')}
          text={t('result.noMatchText')}
          actionLabel={t('result.relaunch')}
          onAction={() => {
            void clearActiveSession().then(() => router.replace('/session'));
          }}
          icon="search-off"
        />
      </Screen>
    );
  }

  const share = async () => {
    await Share.share({
      message: t('result.share', {
        title: result.title,
        duration: result.durationMin,
        budget: result.budgetMax,
      }),
    });
  };

  const roadmap = isPremium ? buildResultRoadmap(result) : [];
  const groups = groupRoadmapByPhase(roadmap);

  return (
    <Screen showBack title={t('result.title')}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>{t('result.ideaKept')}</Text>
        <Text style={styles.title}>{result.title}</Text>
        <Text style={styles.subtitle}>{result.blurb}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.meta}>{result.durationMin} min</Text>
          <Text style={styles.meta}>≤ {result.budgetMax} EUR</Text>
          <Text style={styles.meta}>{result.place}</Text>
        </View>
      </View>

      {isPremium && groups.length > 0 ? (
        <View style={styles.stepsCard}>
          <Text style={styles.stepsTitle}>{t('result.roadmapTitle')}</Text>
          <Text style={styles.stepsLead}>{t('result.roadmapLead')}</Text>
          {groups.map((group) => (
            <View key={group.phase} style={styles.phaseBlock}>
              <Text style={styles.phaseLabel}>{group.phase}</Text>
              {group.items.map((step, index) => (
                <View key={`${group.phase}-${index}-${step.title}`} style={styles.roadmapRow}>
                  <View style={styles.timeline}>
                    <View style={styles.dot} />
                    {index < group.items.length - 1 ? <View style={styles.line} /> : null}
                  </View>
                  <View style={styles.roadmapBody}>
                    <View style={styles.roadmapHeader}>
                      <Text style={styles.roadmapTitle}>{step.title}</Text>
                      {typeof step.minutes === 'number' ? (
                        <Text style={styles.minutes}>~{step.minutes} min</Text>
                      ) : null}
                    </View>
                    <Text style={styles.roadmapDetail}>{step.detail}</Text>
                  </View>
                </View>
              ))}
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.teaserCard}>
          <Text style={styles.teaserTitle}>{t('result.premiumTeaserTitle')}</Text>
          <Text style={styles.teaserText}>{t('result.premiumTeaserText')}</Text>
          <Pressable
            accessibilityRole="button"
            style={styles.teaserCta}
            onPress={() => router.push('/subscription' as Href)}>
            <Text style={styles.teaserCtaText}>{t('result.premiumTeaserCta')}</Text>
          </Pressable>
        </View>
      )}

      <Pressable style={styles.primaryButton} onPress={share}>
        <Text style={styles.primaryText}>{t('result.shareResult')}</Text>
      </Pressable>
      <Pressable
        style={styles.secondaryButton}
        onPress={() => router.replace('/(tabs)')}>
        <Text style={styles.secondaryText}>{t('result.home')}</Text>
      </Pressable>
      <Pressable
        style={styles.ghostButton}
        onPress={() => {
          void clearActiveSession().then(() => router.replace('/session'));
        }}>
        <Text style={styles.ghostText}>{t('result.relaunch')}</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: FlipOn.dark,
    borderRadius: 24,
    padding: 20,
    gap: 8,
  },
  kicker: {
    color: FlipOn.accent,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  title: { color: '#fff', fontSize: 28, fontWeight: '800' },
  subtitle: { color: '#C7CBD1', fontSize: 15, lineHeight: 22 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  meta: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    overflow: 'hidden',
  },
  stepsCard: {
    backgroundColor: FlipOn.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: FlipOn.line,
    padding: 18,
    gap: 14,
  },
  stepsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: FlipOn.ink,
  },
  stepsLead: { fontSize: 13, lineHeight: 19, color: FlipOn.muted, marginTop: -6 },
  phaseBlock: { gap: 10 },
  phaseLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: FlipOn.accent,
  },
  roadmapRow: { flexDirection: 'row', gap: 12, minHeight: 56 },
  timeline: { width: 16, alignItems: 'center' },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: FlipOn.accent,
    marginTop: 4,
  },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: FlipOn.soft,
    marginTop: 4,
    marginBottom: 2,
  },
  roadmapBody: { flex: 1, gap: 4, paddingBottom: 12 },
  roadmapHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  roadmapTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: FlipOn.ink },
  minutes: { fontSize: 12, fontWeight: '700', color: FlipOn.muted },
  roadmapDetail: { fontSize: 14, lineHeight: 20, color: FlipOn.muted },
  teaserCard: {
    backgroundColor: FlipOn.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: FlipOn.line,
    padding: 18,
    gap: 8,
  },
  teaserTitle: { fontSize: 16, fontWeight: '800', color: FlipOn.ink },
  teaserText: { fontSize: 14, lineHeight: 21, color: FlipOn.muted },
  teaserCta: {
    marginTop: 6,
    alignSelf: 'flex-start',
    minHeight: 42,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: FlipOn.accent,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teaserCtaText: { fontSize: 14, fontWeight: '700', color: FlipOn.accent },
  primaryButton: {
    minHeight: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FlipOn.accent,
  },
  primaryText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  secondaryButton: {
    minHeight: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FlipOn.dark,
  },
  secondaryText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  ghostButton: {
    minHeight: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: FlipOn.line,
    backgroundColor: FlipOn.surface,
  },
  ghostText: { color: FlipOn.ink, fontSize: 14, fontWeight: '700' },
});
