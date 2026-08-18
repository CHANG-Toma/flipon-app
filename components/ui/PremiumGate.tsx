/**
 * Gate premium — affiche `children` si l'utilisateur est Premium,
 * sinon un fallback (par défaut : teaser + CTA vers l'écran abonnement).
 */
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { FlipOn } from '@/constants/flipon';
import { useSubscription } from '@/hooks/use-subscription';
import { useI18n } from '@/lib/i18n';

type Props = {
  children: ReactNode;
  /** Composant affiché quand l'utilisateur n'est pas Premium. */
  fallback?: ReactNode;
  /** Si true, masque complètement la section au lieu d'afficher un fallback. */
  hide?: boolean;
};

export function PremiumGate({ children, fallback, hide = false }: Props) {
  const { isPremium, isLoaded } = useSubscription();

  if (!isLoaded) return null;
  if (isPremium) return <>{children}</>;
  if (hide) return null;
  if (fallback) return <>{fallback}</>;

  return <DefaultUpgradeTeaser />;
}

function DefaultUpgradeTeaser() {
  const router = useRouter();
  const { t } = useI18n();

  return (
    <View style={styles.card}>
      <View style={styles.iconRow}>
        <MaterialIcons name="lock" size={20} color={FlipOn.accent} />
        <Text style={styles.title}>{t('premiumGate.title')}</Text>
      </View>
      <Text style={styles.desc}>{t('premiumGate.desc')}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/subscription')}
        style={styles.cta}>
        <Text style={styles.ctaText}>{t('premiumGate.cta')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: FlipOn.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: FlipOn.line,
    padding: 16,
    gap: 10,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: FlipOn.ink,
  },
  desc: {
    fontSize: 13,
    lineHeight: 19,
    color: FlipOn.muted,
  },
  cta: {
    marginTop: 4,
    minHeight: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FlipOn.accent,
  },
  ctaText: {
    fontSize: 14,
    fontWeight: '800',
    color: FlipOn.onAccent,
  },
});
