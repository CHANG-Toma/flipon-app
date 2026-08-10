/**
 * Gérer mon abonnement
 * --------------------
 * Layout aligné sur /tarifs (site) : Basique clair + Boost dark « désirable ».
 * Paiement (RevenueCat) plus tard — CTA Boost désactivé pour l’instant.
 */
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { Screen } from '@/components/ui/Screen';
import { FlipOn } from '@/constants/flipon';
import { useI18n } from '@/lib/i18n';
import type { TranslationKey } from '@/lib/i18n';
import { getSubscription } from '@/lib/subscription';

const FREE_FEATURE_KEYS: TranslationKey[] = [
  'subscription.freeFeature1',
  'subscription.freeFeature2',
  'subscription.freeFeature3',
  'subscription.freeFeature4',
  'subscription.freeFeature5',
];

const BOOST_CHIP_KEYS: TranslationKey[] = [
  'subscription.boostChip1',
  'subscription.boostChip2',
  'subscription.boostChip3',
  'subscription.boostChip4',
];

const BOOST_HIGHLIGHT_KEYS: TranslationKey[] = [
  'subscription.boostHighlight1',
  'subscription.boostHighlight2',
  'subscription.boostHighlight3',
];

const BOOST_FEATURE_KEYS: TranslationKey[] = [
  'subscription.boostFeature1',
  'subscription.boostFeature2',
  'subscription.boostFeature3',
  'subscription.boostFeature4',
  'subscription.boostFeature5',
  'subscription.boostFeature6',
];

export default function SubscriptionScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const sub = getSubscription();
  const onBasique = sub.plan === 'basique';

  return (
    <Screen showBack title={t('subscription.title')}>
      <View style={styles.intro}>
        <Text style={styles.introKicker}>{t('subscription.kicker')}</Text>
        <Text style={styles.introTitle}>{t('subscription.introTitle')}</Text>
        <Text style={styles.introSub}>
          {t('subscription.introSubBefore')}
          <Text style={styles.em}>{t('subscription.introHere')}</Text>
          {t('subscription.introAnd')}
          <Text style={styles.em}>{t('subscription.introNow')}</Text>
          {t('subscription.introSubAfter')}
        </Text>
      </View>

      {/* Basique — offre actuelle */}
      <View style={styles.freeCard}>
        <View style={styles.freeTop}>
          <View>
            <Text style={styles.freeEyebrow}>{t('subscription.freeEyebrow')}</Text>
            <Text style={styles.freeTitle}>{t('subscription.freeTitle')}</Text>
          </View>
          {onBasique ? (
            <View style={styles.currentPill}>
              <Text style={styles.currentPillText}>{t('subscription.current')}</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.freeDesc}>{t('subscription.freeDesc')}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.freePrice}>{t('subscription.priceZero')}</Text>
          <Text style={styles.priceUnit}>{t('subscription.perMonth')}</Text>
        </View>
        <View style={styles.featureList}>
          {FREE_FEATURE_KEYS.map((key) => (
            <FeatureRow key={key} text={t(key)} tone="light" />
          ))}
        </View>
      </View>

      {/* Boost — carte désir (comme le site) */}
      <View style={styles.boostCard}>
        <View style={styles.boostGlow} pointerEvents="none" />
        <View style={styles.boostInner}>
          <Text style={styles.boostEyebrow}>{t('subscription.boostEyebrow')}</Text>
          <Text style={styles.boostTitle}>{t('subscription.boostTitle')}</Text>
          <Text style={styles.boostDesc}>{t('subscription.boostDesc')}</Text>

          <View style={styles.chipRow}>
            {BOOST_CHIP_KEYS.map((key) => (
              <View key={key} style={styles.chip}>
                <Text style={styles.chipText}>{t(key)}</Text>
              </View>
            ))}
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.boostPrice}>{t('subscription.boostPrice')}</Text>
            <Text style={styles.boostPriceUnit}>{t('subscription.perMonth')}</Text>
          </View>

          <View style={styles.highlightList}>
            {BOOST_HIGHLIGHT_KEYS.map((key) => (
              <View key={key} style={styles.highlightRow}>
                <View style={styles.highlightDot} />
                <Text style={styles.highlightText}>{t(key)}</Text>
              </View>
            ))}
          </View>

          <View style={styles.featureList}>
            {BOOST_FEATURE_KEYS.map((key) => (
              <FeatureRow key={key} text={t(key)} tone="dark" />
            ))}
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: true }}
            accessibilityLabel={t('subscription.boostCtaA11y')}
            disabled
            style={styles.boostCta}>
            <Text style={styles.boostCtaText}>{t('subscription.boostCta')}</Text>
            <Text style={styles.boostCtaSoon}>{t('subscription.boostSoon')}</Text>
          </Pressable>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        style={styles.secondary}
        onPress={() => router.back()}>
        <Text style={styles.secondaryText}>{t('subscription.backToProfile')}</Text>
      </Pressable>
    </Screen>
  );
}

function FeatureRow({ text, tone }: { text: string; tone: 'light' | 'dark' }) {
  const onDark = tone === 'dark';
  return (
    <View style={styles.featureRow}>
      <View style={[styles.check, onDark ? styles.checkDark : styles.checkLight]}>
        <MaterialIcons name="check" size={12} color={onDark ? '#fff' : FlipOn.accent} />
      </View>
      <Text style={[styles.featureText, onDark && styles.featureTextDark]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  intro: { gap: 8, marginBottom: 4 },
  introKicker: {
    fontSize: 13,
    fontWeight: '700',
    color: FlipOn.accent,
  },
  introTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: FlipOn.ink,
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  introSub: {
    fontSize: 15,
    lineHeight: 22,
    color: FlipOn.muted,
  },
  em: { fontStyle: 'italic', color: FlipOn.ink, fontWeight: '600' },

  freeCard: {
    backgroundColor: FlipOn.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: FlipOn.line,
    padding: 18,
    gap: 8,
  },
  freeTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  freeEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    color: FlipOn.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  freeTitle: { fontSize: 20, fontWeight: '800', color: FlipOn.ink, marginTop: 2 },
  currentPill: {
    backgroundColor: FlipOn.successSoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  currentPillText: { fontSize: 11, fontWeight: '800', color: FlipOn.success },
  freeDesc: { fontSize: 14, lineHeight: 20, color: FlipOn.muted },
  freePrice: { fontSize: 36, fontWeight: '800', color: FlipOn.ink, letterSpacing: -1 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 4 },
  priceUnit: { fontSize: 14, color: FlipOn.muted, fontWeight: '600' },

  boostCard: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: FlipOn.accent,
    backgroundColor: FlipOn.dark,
    overflow: 'hidden',
  },
  boostGlow: {
    position: 'absolute',
    top: -40,
    right: -30,
    width: 220,
    height: 180,
    borderRadius: 110,
    backgroundColor: 'rgba(249, 115, 22, 0.35)',
  },
  boostInner: { padding: 18, gap: 10, position: 'relative' },
  boostEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    color: FlipOn.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  boostTitle: { fontSize: 22, fontWeight: '800', color: '#fff', marginTop: -2 },
  boostDesc: { fontSize: 14, lineHeight: 21, color: 'rgba(255,255,255,0.72)' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 2 },
  chip: {
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.4)',
    backgroundColor: 'rgba(249, 115, 22, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  chipText: { fontSize: 11, fontWeight: '700', color: FlipOn.accent },
  boostPrice: { fontSize: 36, fontWeight: '800', color: '#fff', letterSpacing: -1 },
  boostPriceUnit: { fontSize: 14, color: 'rgba(255,255,255,0.55)', fontWeight: '600' },

  highlightList: { gap: 8, marginTop: 2 },
  highlightRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  highlightDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: FlipOn.accent,
  },
  highlightText: { fontSize: 14, fontWeight: '700', color: '#fff' },

  featureList: { gap: 10, marginTop: 6 },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  check: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkLight: { backgroundColor: FlipOn.accentSoft },
  checkDark: { backgroundColor: FlipOn.accent },
  featureText: { flex: 1, fontSize: 14, lineHeight: 20, color: FlipOn.ink, fontWeight: '500' },
  featureTextDark: { color: 'rgba(255,255,255,0.92)' },

  boostCta: {
    marginTop: 10,
    minHeight: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FlipOn.accent,
    gap: 2,
    opacity: 0.92,
  },
  boostCtaText: { fontSize: 15, fontWeight: '800', color: '#fff' },
  boostCtaSoon: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.85)' },

  secondary: {
    minHeight: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: FlipOn.line,
    backgroundColor: FlipOn.surface,
  },
  secondaryText: { fontSize: 14, fontWeight: '700', color: FlipOn.ink },
});
