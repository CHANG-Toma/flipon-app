import { Pressable, Share, Text, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';

import { Screen } from '@/components/ui/Screen';
import { EmptyState } from '@/components/ui/EmptyState';
import { flowStyles } from '@/components/ui/flow-styles';
import { useSubscription } from '@/hooks/use-subscription';
import { useI18n } from '@/lib/i18n';
import { buildResultRoadmap, groupRoadmapByPhase } from '@/lib/premium/roadmap';
import { clearActiveSession, getSession } from '@/lib/session/store';

/**
 * Résultat
 * --------------------------
 * Sans abonnement : idée matchée + teaser.
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
      <View style={flowStyles.hero}>
        <Text style={flowStyles.kicker}>{t('result.ideaKept')}</Text>
        <Text style={flowStyles.heroTitle}>{result.title}</Text>
        <Text style={flowStyles.heroSubtitle}>{result.blurb}</Text>
        <View style={flowStyles.metaRow}>
          <Text style={flowStyles.metaPill}>{result.durationMin} min</Text>
          <Text style={flowStyles.metaPill}>≤ {result.budgetMax} EUR</Text>
          <Text style={flowStyles.metaPill}>{result.place}</Text>
        </View>
      </View>

      {isPremium && groups.length > 0 ? (
        <View style={flowStyles.surfaceCard}>
          <Text style={flowStyles.surfaceTitle}>{t('result.roadmapTitle')}</Text>
          <Text style={flowStyles.surfaceLead}>{t('result.roadmapLead')}</Text>
          {groups.map((group) => (
            <View key={group.phase} style={flowStyles.phaseBlock}>
              <Text style={flowStyles.phaseLabel}>{group.phase}</Text>
              {group.items.map((step, index) => (
                <View key={`${group.phase}-${index}-${step.title}`} style={flowStyles.roadmapRow}>
                  <View style={flowStyles.timeline}>
                    <View style={flowStyles.dot} />
                    {index < group.items.length - 1 ? <View style={flowStyles.timelineLine} /> : null}
                  </View>
                  <View style={flowStyles.roadmapBody}>
                    <View style={flowStyles.roadmapHeader}>
                      <Text style={flowStyles.roadmapTitle}>{step.title}</Text>
                      {typeof step.minutes === 'number' ? (
                        <Text style={flowStyles.roadmapMinutes}>~{step.minutes} min</Text>
                      ) : null}
                    </View>
                    <Text style={flowStyles.roadmapDetail}>{step.detail}</Text>
                  </View>
                </View>
              ))}
            </View>
          ))}
        </View>
      ) : (
        <View style={flowStyles.surfaceCard}>
          <Text style={flowStyles.surfaceTitle}>{t('result.premiumTeaserTitle')}</Text>
          <Text style={flowStyles.surfaceLead}>{t('result.premiumTeaserText')}</Text>
          <Pressable
            accessibilityRole="button"
            style={flowStyles.teaserCta}
            onPress={() => router.push('/subscription' as Href)}>
            <Text style={flowStyles.teaserCtaText}>{t('result.premiumTeaserCta')}</Text>
          </Pressable>
        </View>
      )}

      <Pressable style={flowStyles.primaryButton} onPress={share}>
        <Text style={flowStyles.primaryText}>{t('result.shareResult')}</Text>
      </Pressable>
      <Pressable style={flowStyles.secondaryButton} onPress={() => router.replace('/(tabs)')}>
        <Text style={flowStyles.secondaryText}>{t('result.home')}</Text>
      </Pressable>
      <Pressable
        style={flowStyles.ghostButton}
        onPress={() => {
          void clearActiveSession().then(() => router.replace('/session'));
        }}>
        <Text style={flowStyles.ghostText}>{t('result.relaunch')}</Text>
      </Pressable>
    </Screen>
  );
}
