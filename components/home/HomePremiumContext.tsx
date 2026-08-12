import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { FlipOn, cardShadow } from '@/constants/flipon';
import { usePremiumContext } from '@/hooks/use-premium-context';
import { useI18n } from '@/lib/i18n';
import type { TranslationKey } from '@/lib/i18n';
import {
  formatLocalTime,
  momentOfDayKey,
  weatherCodeToLabelKey,
} from '@/lib/premium/context';

type Props = {
  enabled: boolean;
};

/**
 * Carte Accueil Premium — lieu + heure + météo.
 * Permission demandée uniquement via CTA (conformité stores).
 */
export function HomePremiumContext({ enabled }: Props) {
  const { t, locale } = useI18n();
  const ctx = usePremiumContext(enabled);

  if (!enabled) return null;

  const now = new Date();
  const momentKey = momentOfDayKey(now);
  const momentLabel = t(`premiumContext.moment.${momentKey}` as TranslationKey);
  const timeLabel = formatLocalTime(now, locale);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.kicker}>{t('subscription.premiumTitle')}</Text>
          <Text style={styles.title}>{t('premiumContext.title')}</Text>
        </View>
        {ctx.status === 'ready' ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('premiumContext.refreshA11y')}
            onPress={() => void ctx.refresh()}
            hitSlop={10}
            style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}>
            <MaterialIcons name="refresh" size={20} color={FlipOn.muted} />
          </Pressable>
        ) : null}
      </View>

      {ctx.status === 'idle' ? (
        <>
          <Text style={styles.subtitle}>{t('premiumContext.subtitle')}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('premiumContext.ctaA11y')}
            style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
            onPress={() => void ctx.activate()}>
            <MaterialIcons name="my-location" size={18} color={FlipOn.onAccent} />
            <Text style={styles.ctaText}>{t('premiumContext.cta')}</Text>
          </Pressable>
        </>
      ) : null}

      {ctx.status === 'loading' ? (
        <View style={styles.rowCenter}>
          <ActivityIndicator color={FlipOn.accent} />
          <Text style={styles.muted}>{t('premiumContext.loading')}</Text>
        </View>
      ) : null}

      {ctx.status === 'ready' && ctx.snapshot ? (
        <View style={styles.body}>
          <View style={styles.line}>
            <MaterialIcons name="place" size={18} color={FlipOn.accent} />
            <Text style={styles.lineText} numberOfLines={1}>
              {ctx.snapshot.place.label}
            </Text>
          </View>
          <View style={styles.line}>
            <MaterialIcons name="schedule" size={18} color={FlipOn.accent} />
            <Text style={styles.lineText}>
              {t('premiumContext.timeLine', { time: timeLabel, moment: momentLabel })}
            </Text>
          </View>
          <View style={styles.line}>
            <MaterialIcons name="wb-cloudy" size={18} color={FlipOn.accent} />
            <Text style={styles.lineText}>
              {t('premiumContext.weatherLine', {
                temp: ctx.snapshot.weather.temperatureC,
                condition: t(
                  `premiumContext.weather.${weatherCodeToLabelKey(ctx.snapshot.weather.weatherCode)}` as TranslationKey,
                ),
              })}
            </Text>
          </View>
        </View>
      ) : null}

      {ctx.status === 'denied' || ctx.status === 'error' ? (
        <View style={styles.body}>
          {ctx.status === 'denied' ? (
            <Text style={styles.errorTitle}>{t('premiumContext.deniedTitle')}</Text>
          ) : null}
          <Text style={styles.muted}>{ctx.errorMessage}</Text>
          <View style={styles.actions}>
            {ctx.status === 'denied' ? (
              <Pressable
                accessibilityRole="button"
                style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
                onPress={() => void ctx.openSettings()}>
                <Text style={styles.secondaryText}>{t('premiumContext.openSettings')}</Text>
              </Pressable>
            ) : null}
            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
              onPress={() => void (ctx.status === 'denied' ? ctx.activate() : ctx.refresh())}>
              <Text style={styles.ctaText}>{t('premiumContext.retry')}</Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: FlipOn.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: FlipOn.line,
    padding: 16,
    gap: 12,
    ...cardShadow,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  headerText: { flex: 1, gap: 2 },
  kicker: {
    fontSize: 11,
    fontWeight: '700',
    color: FlipOn.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: { fontSize: 17, fontWeight: '800', color: FlipOn.ink },
  subtitle: { fontSize: 14, lineHeight: 20, color: FlipOn.muted },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FlipOn.soft,
  },
  body: { gap: 10 },
  line: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  lineText: { flex: 1, fontSize: 15, fontWeight: '600', color: FlipOn.ink },
  rowCenter: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
  muted: { fontSize: 14, lineHeight: 20, color: FlipOn.muted, flex: 1 },
  errorTitle: { fontSize: 15, fontWeight: '800', color: FlipOn.ink },
  actions: { gap: 8, marginTop: 4 },
  cta: {
    minHeight: 46,
    borderRadius: 14,
    backgroundColor: FlipOn.accent,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  ctaText: { color: FlipOn.onAccent, fontSize: 14, fontWeight: '700' },
  secondaryBtn: {
    minHeight: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: FlipOn.line,
    backgroundColor: FlipOn.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  secondaryText: { fontSize: 14, fontWeight: '700', color: FlipOn.ink },
  pressed: { opacity: 0.88 },
});
