/**
 * Preview des loaders — ouvrir via /loader-preview (Profil → Aperçu chargement en dev).
 */
import { useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { PremiumLoader } from '@/components/ui/PremiumLoader';
import { PulseRing } from '@/components/ui/pulse-ring';
import { Screen } from '@/components/ui/Screen';
import { FlipOn } from '@/constants/flipon';

export default function LoaderPreviewScreen() {
  const router = useRouter();
  const [showFullSplash, setShowFullSplash] = useState(false);

  if (showFullSplash) {
    return (
      <View style={styles.fullWrap}>
        <PremiumLoader message="Connexion en cours…" />
        <Pressable style={styles.closeSplash} onPress={() => setShowFullSplash(false)}>
          <Text style={styles.closeSplashText}>Fermer l’aperçu splash</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <Screen showBack onBack={() => router.back()} title="Aperçu chargement">
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.lead}>
          Pulse Ring natif (équivalent shadcn). Compare les tailles et le splash complet.
        </Text>

        <Pressable style={styles.cta} onPress={() => setShowFullSplash(true)}>
          <Text style={styles.ctaText}>Voir le splash plein écran</Text>
        </Pressable>

        <PreviewBlock title="Pulse Ring · lg" dark>
          <PulseRing size="lg" />
        </PreviewBlock>

        <PreviewBlock title="Pulse Ring · md" dark>
          <PulseRing size="md" />
        </PreviewBlock>

        <PreviewBlock title="Pulse Ring · sm" dark>
          <PulseRing size="sm" />
        </PreviewBlock>

        <PreviewBlock title="Sur fond clair · md" dark={false}>
          <PulseRing size="md" color={FlipOn.accent} />
        </PreviewBlock>

        <PreviewBlock title="PremiumLoader (inline)" dark>
          <View style={styles.inlineLoader}>
            <PremiumLoader fullScreen={false} message="Synchronisation…" />
          </View>
        </PreviewBlock>
      </ScrollView>
    </Screen>
  );
}

function PreviewBlock({
  title,
  dark,
  children,
}: {
  title: string;
  dark: boolean;
  children: ReactNode;
}) {
  return (
    <View style={styles.block}>
      <Text style={styles.blockTitle}>{title}</Text>
      <View style={[styles.stage, dark ? styles.stageDark : styles.stageLight]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 48, gap: 20 },
  lead: {
    fontSize: 14,
    lineHeight: 21,
    color: FlipOn.muted,
    marginBottom: 4,
  },
  cta: {
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: FlipOn.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  block: { gap: 10 },
  blockTitle: { fontSize: 13, fontWeight: '700', color: FlipOn.muted },
  stage: {
    minHeight: 200,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: FlipOn.line,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
    overflow: 'visible',
  },
  stageDark: { backgroundColor: FlipOn.dark },
  stageLight: { backgroundColor: FlipOn.surface },
  inlineLoader: {
    width: '100%',
    height: 320,
    borderRadius: 12,
    overflow: 'hidden',
  },
  fullWrap: { flex: 1 },
  closeSplash: {
    position: 'absolute',
    bottom: 48,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  closeSplashText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
