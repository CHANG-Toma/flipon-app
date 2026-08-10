import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FlipOn } from '@/constants/flipon';
import { useI18n } from '@/lib/i18n';
import type { LanguagePreference } from '@/lib/i18n/types';

const OPTIONS: LanguagePreference[] = ['system', 'fr', 'en'];

export function LanguagePreferenceBlock() {
  const { t, preference, setPreference } = useI18n();

  const label = (pref: LanguagePreference) => {
    if (pref === 'system') return t('profile.languageSystem');
    if (pref === 'fr') return t('profile.languageFrench');
    return t('profile.languageEnglish');
  };

  return (
    <View style={styles.block}>
      <Text style={styles.blockTitle}>{t('profile.language')}</Text>
      <Text style={styles.hint}>{t('profile.languageHint')}</Text>
      <View style={styles.row}>
        {OPTIONS.map((opt) => {
          const selected = preference === opt;
          return (
            <Pressable
              key={opt}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => void setPreference(opt)}
              style={[styles.chip, selected && styles.chipSelected]}>
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                {label(opt)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    backgroundColor: FlipOn.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: FlipOn.line,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    gap: 10,
  },
  blockTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: FlipOn.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  hint: { fontSize: 12, lineHeight: 17, color: FlipOn.muted },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: FlipOn.line,
    backgroundColor: FlipOn.soft,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 40,
    justifyContent: 'center',
  },
  chipSelected: {
    borderColor: FlipOn.accent,
    backgroundColor: FlipOn.accentSoft,
  },
  chipText: { fontSize: 13, fontWeight: '700', color: FlipOn.ink },
  chipTextSelected: { color: FlipOn.accentInk },
});
