import { StyleSheet } from 'react-native';

import { FlipOn, cardShadow } from '@/constants/flipon';

export const homeStyles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: FlipOn.bg },
  flex: { flex: 1 },
  screen: {
    flex: 1,
    paddingTop: 12,
    paddingBottom: 100,
  },
  headerBlock: {
    paddingHorizontal: 24,
    paddingBottom: 4,
  },
  cards: {
    flex: 1,
    justifyContent: 'center',
  },
  pressed: { opacity: 0.88 },

  /* Session active */
  heroWrap: { gap: 0 },
  heroClose: { position: 'absolute', top: 14, right: 14, zIndex: 2 },
  activeCard: {
    minHeight: 168,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: FlipOn.accentBorder,
    backgroundColor: FlipOn.dark,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 18,
    justifyContent: 'space-between',
    ...cardShadow,
  },
  activeBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 96,
  },
  badgeLive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: FlipOn.accent },
  badgeLiveText: { color: FlipOn.ink, fontSize: 12, fontWeight: '700' },
  activeCode: {
    color: FlipOn.ink,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 4,
  },
  progressBlock: { width: '72%', marginTop: 4 },
  progressTrack: {
    height: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 999, backgroundColor: FlipOn.accent },
  activeTitle: {
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '800',
    color: FlipOn.ink,
    letterSpacing: -0.2,
  },
});
