/**
 * Gérer mon abonnement
 * --------------------
 * Paywall RevenueCat (monthly / yearly) + Customer Center si déjà Premium.
 */
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { Screen } from '@/components/ui/Screen';
import { FlipOn, cardShadow } from '@/constants/flipon';
import { useSubscription } from '@/hooks/use-subscription';
import { useI18n } from '@/lib/i18n';
import type { TranslationKey } from '@/lib/i18n';
import {
  hasPremiumEntitlement,
  presentFlipOnCustomerCenter,
  presentFlipOnPaywall,
  restorePurchases,
} from '@/lib/revenuecat';

const FREE_FEATURE_KEYS: TranslationKey[] = [
  'subscription.freeFeature1',
  'subscription.freeFeature2',
  'subscription.freeFeature3',
  'subscription.freeFeature4',
  'subscription.freeFeature5',
];

const BOOST_CHIP_KEYS: TranslationKey[] = [
  'subscription.premiumChip1',
  'subscription.premiumChip2',
  'subscription.premiumChip3',
  'subscription.premiumChip4',
];

const BOOST_HIGHLIGHT_KEYS: TranslationKey[] = [
  'subscription.premiumHighlight1',
  'subscription.premiumHighlight2',
  'subscription.premiumHighlight3',
];

const BOOST_FEATURE_KEYS: TranslationKey[] = [
  'subscription.premiumFeature1',
  'subscription.premiumFeature2',
  'subscription.premiumFeature3',
  'subscription.premiumFeature4',
  'subscription.premiumFeature5',
  'subscription.premiumFeature6',
];

export default function SubscriptionScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { plan, isPremium, reload, isLoaded } = useSubscription();
  const onBasique = plan === 'basique';
  const onPremium = isPremium;
  const [busy, setBusy] = useState<'paywall' | 'manage' | 'restore' | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  async function onUpgrade() {
    if (busy) return;
    setBusy('paywall');
    setStatus(null);
    try {
      const result = await presentFlipOnPaywall();
      if (result === 'granted') {
        await reload();
      } else if (result === 'error') {
        setStatus(t('subscription.paywallError'));
      }
    } finally {
      setBusy(null);
    }
  }

  async function onManage() {
    if (busy) return;
    setBusy('manage');
    setStatus(null);
    try {
      const ok = await presentFlipOnCustomerCenter();
      await reload();
      if (!ok) setStatus(t('subscription.manageError'));
    } finally {
      setBusy(null);
    }
  }

  async function onRestore() {
    if (busy) return;
    setBusy('restore');
    setStatus(null);
    try {
      const info = await restorePurchases();
      await reload();
      if (hasPremiumEntitlement(info)) {
        setStatus(t('subscription.restoreOk'));
      } else {
        setStatus(t('subscription.restoreNone'));
      }
    } catch {
      setStatus(t('subscription.paywallError'));
    } finally {
      setBusy(null);
    }
  }

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

      {/* Premium — carte désir (comme le site) */}
      <View style={styles.premiumCard}>
        <View style={[styles.premiumGlow, { pointerEvents: 'none' }]} />
        <View style={styles.premiumInner}>
          <View style={styles.premiumTop}>
            <View>
              <Text style={styles.premiumEyebrow}>{t('subscription.premiumEyebrow')}</Text>
              <Text style={styles.premiumTitle}>{t('subscription.premiumTitle')}</Text>
            </View>
            {onPremium ? (
              <View style={styles.currentPillDark}>
                <Text style={styles.currentPillDarkText}>{t('subscription.current')}</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.premiumDesc}>{t('subscription.premiumDesc')}</Text>

          <View style={styles.chipRow}>
            {BOOST_CHIP_KEYS.map((key) => (
              <View key={key} style={styles.chip}>
                <Text style={styles.chipText}>{t(key)}</Text>
              </View>
            ))}
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.premiumPrice}>{t('subscription.premiumPrice')}</Text>
            <Text style={styles.premiumPriceUnit}>{t('subscription.perMonth')}</Text>
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

          {onPremium ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('subscription.manageCta')}
              disabled={Boolean(busy) || !isLoaded}
              onPress={() => void onManage()}
              style={[styles.premiumCta, busy && styles.premiumCtaBusy]}>
              <Text style={styles.premiumCtaText}>{t('subscription.manageCta')}</Text>
            </Pressable>
          ) : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('subscription.premiumCtaA11y')}
              disabled={Boolean(busy) || !isLoaded}
              onPress={() => void onUpgrade()}
              style={[styles.premiumCta, busy && styles.premiumCtaBusy]}>
              <Text style={styles.premiumCtaText}>{t('subscription.premiumCta')}</Text>
            </Pressable>
          )}
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('subscription.restoreCta')}
        disabled={Boolean(busy)}
        onPress={() => void onRestore()}
        style={styles.secondary}>
        <Text style={styles.secondaryText}>{t('subscription.restoreCta')}</Text>
      </Pressable>

      {status ? <Text style={styles.status}>{status}</Text> : null}

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
        <MaterialIcons name="check" size={12} color={onDark ? FlipOn.onAccent : FlipOn.accent} />
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
    ...cardShadow,
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

  premiumCard: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: FlipOn.accent,
    backgroundColor: FlipOn.dark,
    overflow: 'hidden',
    ...cardShadow,
  },
  premiumGlow: {
    position: 'absolute',
    top: -40,
    right: -30,
    width: 220,
    height: 180,
    borderRadius: 110,
    backgroundColor: 'rgba(255, 106, 43, 0.28)',
  },
  premiumInner: { padding: 18, gap: 10, position: 'relative' },
  premiumTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  premiumEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    color: FlipOn.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  premiumTitle: { fontSize: 22, fontWeight: '800', color: FlipOn.ink, marginTop: -2 },
  currentPillDark: {
    backgroundColor: 'rgba(255, 106, 43, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 106, 43, 0.45)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  currentPillDarkText: { fontSize: 11, fontWeight: '800', color: FlipOn.accent },
  premiumDesc: { fontSize: 14, lineHeight: 21, color: FlipOn.muted },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 2 },
  chip: {
    borderWidth: 1,
    borderColor: 'rgba(255, 106, 43, 0.35)',
    backgroundColor: 'rgba(255, 106, 43, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  chipText: { fontSize: 11, fontWeight: '700', color: FlipOn.accentInk },
  premiumPrice: { fontSize: 36, fontWeight: '800', color: FlipOn.ink, letterSpacing: -1 },
  premiumPriceUnit: { fontSize: 14, color: FlipOn.muted, fontWeight: '600' },

  highlightList: { gap: 8, marginTop: 2 },
  highlightRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  highlightDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: FlipOn.accent,
  },
  highlightText: { fontSize: 14, fontWeight: '700', color: FlipOn.ink },

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

  premiumCta: {
    marginTop: 10,
    minHeight: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FlipOn.accent,
    gap: 2,
  },
  premiumCtaBusy: { opacity: 0.7 },
  premiumCtaText: { fontSize: 15, fontWeight: '800', color: FlipOn.onAccent },

  status: {
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 18,
    color: FlipOn.muted,
  },

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
