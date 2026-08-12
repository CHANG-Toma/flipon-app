import { StyleSheet, Text, View } from 'react-native';

import { FlipOn } from '@/constants/flipon';

type Props = {
  label: string;
};

export function HistoryDayDivider({ label }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.line} />
      <Text style={styles.label}>{label}</Text>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
    marginTop: 4,
    marginBottom: 2,
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: FlipOn.line,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: FlipOn.muted,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
});
