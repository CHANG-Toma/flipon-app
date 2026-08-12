import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter, type Href } from 'expo-router';

import { FlipOn } from '@/constants/flipon';
import { usePremiumContext } from '@/hooks/use-premium-context';
import { useI18n } from '@/lib/i18n';
import type { TranslationKey } from '@/lib/i18n';
import {
  formatLocalTime,
  weatherCodeToLabelKey,
} from '@/lib/premium/context';

type Props = {
  hello: string;
  isPremium: boolean;
};

function Sep() {
  return <Text style={styles.sep}>·</Text>;
}

/**
 * Bandeau accueil — salut + contexte Premium inline, sans carte.
 */
export function HomePremiumContext({ hello, isPremium }: Props) {
  const router = useRouter();
  const { t, locale } = useI18n();
  const ctx = usePremiumContext(isPremium);

  const now = new Date();
  const timeLabel = formatLocalTime(now, locale);

  const placeLabel =
    ctx.snapshot?.place.isApproximate
      ? t('premiumContext.approxPlace')
      : ctx.snapshot?.place.label;

  return (
    <View style={styles.wrap}>
      <Text style={styles.hello}>{hello}</Text>

      {!isPremium ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('home.premiumTeaserA11y')}
          onPress={() => router.push('/subscription' as Href)}
          style={({ pressed }) => [styles.inlineRow, pressed && styles.pressed]}>
          <View style={styles.premiumPill}>
            <Text style={styles.premiumPillText}>{t('subscription.premiumTitle')}</Text>
          </View>
          <Text style={styles.inlineText} numberOfLines={1}>
            {t('home.premiumTeaser')}
          </Text>
          <MaterialIcons name="chevron-right" size={16} color={FlipOn.muted} />
        </Pressable>
      ) : null}

      {isPremium && ctx.status === 'idle' ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('premiumContext.ctaA11y')}
          onPress={() => void ctx.activate()}
          style={({ pressed }) => [styles.inlineRow, pressed && styles.pressed]}>
          <MaterialIcons name="my-location" size={14} color={FlipOn.accent} />
          <Text style={styles.linkText}>{t('premiumContext.cta')}</Text>
        </Pressable>
      ) : null}

      {isPremium && ctx.status === 'loading' ? (
        <View style={styles.inlineRow}>
          <ActivityIndicator size="small" color={FlipOn.accent} />
          <Text style={styles.inlineText}>{t('premiumContext.loading')}</Text>
        </View>
      ) : null}

      {isPremium && ctx.status === 'ready' && ctx.snapshot ? (
        <View style={styles.contextRow}>
          <View style={styles.contextLine}>
            <MaterialIcons name="place" size={14} color={FlipOn.accent} />
            <Text style={styles.contextItem} numberOfLines={1}>
              {placeLabel}
            </Text>
            <Sep />
            <Text style={styles.contextItem}>{timeLabel}</Text>
            <Sep />
            <Text style={styles.contextItem} numberOfLines={1}>
              {t('premiumContext.weatherLine', {
                temp: ctx.snapshot.weather.temperatureC,
                condition: t(
                  `premiumContext.weather.${weatherCodeToLabelKey(ctx.snapshot.weather.weatherCode)}` as TranslationKey,
                ),
              })}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('premiumContext.refreshA11y')}
            onPress={() => void ctx.refresh()}
            hitSlop={8}
            style={({ pressed }) => [styles.refreshBtn, pressed && styles.pressed]}>
            <MaterialIcons name="refresh" size={15} color={FlipOn.muted} />
          </Pressable>
        </View>
      ) : null}

      {isPremium && (ctx.status === 'denied' || ctx.status === 'error') ? (
        <View style={styles.errorRow}>
          <Text style={styles.inlineText} numberOfLines={1}>
            {ctx.status === 'denied' ? t('premiumContext.deniedTitle') : ctx.errorMessage}
          </Text>
          {ctx.status === 'denied' ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => void ctx.openSettings()}
              style={({ pressed }) => [styles.inlineLink, pressed && styles.pressed]}>
              <Text style={styles.linkText}>{t('premiumContext.openSettings')}</Text>
            </Pressable>
          ) : (
            <Pressable
              accessibilityRole="button"
              onPress={() => void ctx.refresh()}
              style={({ pressed }) => [styles.inlineLink, pressed && styles.pressed]}>
              <Text style={styles.linkText}>{t('premiumContext.retry')}</Text>
            </Pressable>
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 6,
    paddingHorizontal: 2,
    paddingBottom: 4,
  },
  hello: {
    fontSize: 24,
    fontWeight: '700',
    color: FlipOn.ink,
    letterSpacing: -0.3,
    lineHeight: 28,
  },
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  premiumPill: {
    backgroundColor: FlipOn.accentSoft,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  premiumPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: FlipOn.accentInk,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  inlineText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: FlipOn.muted,
    lineHeight: 18,
  },
  linkText: {
    fontSize: 13,
    fontWeight: '700',
    color: FlipOn.accentInk,
    lineHeight: 18,
  },
  contextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  contextLine: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 5,
    rowGap: 2,
  },
  contextItem: {
    fontSize: 13,
    fontWeight: '500',
    color: FlipOn.muted,
    lineHeight: 18,
    flexShrink: 1,
  },
  sep: {
    fontSize: 13,
    color: FlipOn.line,
    lineHeight: 18,
  },
  refreshBtn: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  inlineLink: { flexShrink: 0 },
  pressed: { opacity: 0.75 },
});
