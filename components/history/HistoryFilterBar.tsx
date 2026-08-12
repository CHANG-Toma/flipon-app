import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { FlipOn } from '@/constants/flipon';
import type { HistoryFilterDef, HistoryFilterId } from '@/lib/history/filters';
import { useI18n, type TranslationKey } from '@/lib/i18n';

type Props = {
  filters: HistoryFilterDef[];
  active: HistoryFilterId;
  onChange: (id: HistoryFilterId) => void;
};

export function HistoryFilterBar({ filters, active, onChange }: Props) {
  const { t } = useI18n();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}>
      {filters.map((filter) => {
        const selected = filter.id === active;
        return (
          <Pressable
            key={filter.id}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(filter.id)}
            style={[styles.chip, selected && styles.chipActive]}>
            {filter.icon ? (
              <MaterialIcons
                name={filter.icon}
                size={15}
                color={selected ? FlipOn.ink : FlipOn.muted}
              />
            ) : null}
            <Text style={[styles.chipText, selected && styles.chipTextActive]}>
              {t(filter.labelKey as TranslationKey)}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 8,
    paddingVertical: 2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: FlipOn.soft,
    borderWidth: 1,
    borderColor: FlipOn.line,
  },
  chipActive: {
    backgroundColor: FlipOn.surface,
    borderColor: FlipOn.ink,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: FlipOn.muted,
  },
  chipTextActive: {
    color: FlipOn.ink,
    fontWeight: '800',
  },
});
