import type { ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter, type Href } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';

import { HomeHeroCard, homeHeroCardHeight } from '@/components/home/HomeHeroCard';
import { FlipOn } from '@/constants/flipon';
import { usePremiumContext } from '@/hooks/use-premium-context';
import { useI18n } from '@/lib/i18n';
import { normalizeSessionCode } from '@/lib/session-code';

const SCREEN_WIDTH = Dimensions.get('window').width;
const PEEK = 44;
const CARD_GAP = 16;
const CARD_WIDTH = SCREEN_WIDTH - PEEK * 2;
const SNAP_OFFSET = CARD_WIDTH + CARD_GAP;
const SNAP_OFFSETS = [0, SNAP_OFFSET, SNAP_OFFSET * 2] as const;
const DEFAULT_INDEX = 1;
const SIDE_SCALE = 0.88;
const SIDE_OPACITY = 0.68;
const DOT_IDLE = 6;
const DOT_ACTIVE = 18;

type Props = {
  joinCode: string;
  joinError: string | null;
  isPremium: boolean;
  onChangeCode: (code: string) => void;
  onJoin: () => void;
};

type SlideProps = {
  index: number;
  scrollX: SharedValue<number>;
  isLast?: boolean;
  children: ReactNode;
};

type DotProps = {
  index: number;
  scrollX: SharedValue<number>;
  label: string;
  onPress: () => void;
};

function CarouselDot({ index, scrollX, label, onPress }: DotProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * SNAP_OFFSET,
      index * SNAP_OFFSET,
      (index + 1) * SNAP_OFFSET,
    ];
    const width = interpolate(
      scrollX.value,
      inputRange,
      [DOT_IDLE, DOT_ACTIVE, DOT_IDLE],
      Extrapolation.CLAMP,
    );
    const backgroundColor = interpolateColor(scrollX.value, inputRange, [
      FlipOn.line,
      FlipOn.accent,
      FlipOn.line,
    ]);

    return { width, backgroundColor };
  });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={styles.dotHit}>
      <Animated.View style={[styles.dot, animatedStyle]} />
    </Pressable>
  );
}

function CarouselSlide({ index, scrollX, isLast, children }: SlideProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * SNAP_OFFSET,
      index * SNAP_OFFSET,
      (index + 1) * SNAP_OFFSET,
    ];

    const scale = interpolate(
      scrollX.value,
      inputRange,
      [SIDE_SCALE, 1, SIDE_SCALE],
      Extrapolation.CLAMP,
    );
    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [SIDE_OPACITY, 1, SIDE_OPACITY],
      Extrapolation.CLAMP,
    );
    const translateY = interpolate(
      scrollX.value,
      inputRange,
      [10, 0, 10],
      Extrapolation.CLAMP,
    );

    return {
      opacity,
      transform: [{ scale }, { translateY }],
    };
  });

  return (
    <View style={[styles.slide, isLast && styles.slideLast]}>
      <Animated.View style={[styles.slideInner, animatedStyle]}>{children}</Animated.View>
    </View>
  );
}

export function HomeCarousel({
  joinCode,
  joinError,
  isPremium,
  onChangeCode,
  onJoin,
}: Props) {
  const router = useRouter();
  const { t } = useI18n();
  const scrollRef = useRef<Animated.ScrollView>(null);
  const premium = usePremiumContext(isPremium);
  const canJoin = joinCode.trim().length > 0;
  const [layoutReady, setLayoutReady] = useState(false);
  const scrollX = useSharedValue(SNAP_OFFSET * DEFAULT_INDEX);
  const lastHapticIndex = useRef(DEFAULT_INDEX);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const scrollToIndex = useCallback((index: number, animated: boolean) => {
    const x = SNAP_OFFSETS[index] ?? 0;
    scrollX.value = x;
    scrollRef.current?.scrollTo({ x, animated });
  }, [scrollX]);

  useEffect(() => {
    if (!layoutReady) return;
    scrollToIndex(DEFAULT_INDEX, false);
  }, [layoutReady, scrollToIndex]);

  const snapToCenter = useCallback(
    (index: 0 | 1 | 2) => {
      lastHapticIndex.current = index;
      scrollToIndex(index, true);
    },
    [scrollToIndex],
  );

  const onScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = event.nativeEvent.contentOffset.x;
    const index = SNAP_OFFSETS.reduce((best, offset, i) => {
      const bestDist = Math.abs(SNAP_OFFSETS[best] - x);
      const dist = Math.abs(offset - x);
      return dist < bestDist ? i : best;
    }, 0);
    scrollX.value = SNAP_OFFSETS[index] ?? 0;
    if (lastHapticIndex.current !== index) {
      lastHapticIndex.current = index;
      void Haptics.selectionAsync();
    }
  };

  const goSession = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/session' as Href);
  };

  const goNearby = async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!isPremium) {
      router.push('/subscription' as Href);
      return;
    }
    if (premium.status === 'idle' || premium.status === 'denied' || premium.status === 'error') {
      await premium.activate();
    }
    router.push('/session' as Href);
  };

  return (
    <View style={styles.wrap} onLayout={() => setLayoutReady(true)}>
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToOffsets={[...SNAP_OFFSETS]}
        snapToAlignment="start"
        disableIntervalMomentum
        scrollEventThrottle={16}
        contentContainerStyle={styles.content}
        onScroll={scrollHandler}
        onMomentumScrollEnd={onScrollEnd}
        onScrollEndDrag={onScrollEnd}>
        <CarouselSlide index={0} scrollX={scrollX}>
          <HomeHeroCard
            image={require('../../assets/images/home-join.jpg')}
            title={t('home.joinCardTitleLine')}
            meta={t('home.joinCardMeta')}
            badge={t('home.joinBadge')}
            icon="group-add"
            overlay={
              <View style={styles.joinOverlay}>
                <View style={styles.joinInputRow}>
                  <TextInput
                    value={joinCode}
                    onChangeText={(value) => onChangeCode(normalizeSessionCode(value))}
                    placeholder={t('home.joinPlaceholder')}
                    placeholderTextColor="rgba(255,255,255,0.45)"
                    autoCapitalize="characters"
                    autoCorrect={false}
                    autoComplete="off"
                    textContentType="oneTimeCode"
                    maxLength={4}
                    returnKeyType="go"
                    onSubmitEditing={onJoin}
                    accessibilityLabel={t('home.joinCodeA11y')}
                    style={styles.joinInput}
                  />
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t('home.joinButtonA11y')}
                    style={[styles.joinGo, !canJoin && styles.joinGoDisabled]}
                    onPress={onJoin}
                    disabled={!canJoin}>
                    <MaterialIcons name="arrow-forward" size={22} color={FlipOn.onAccent} />
                  </Pressable>
                </View>
              </View>
            }
          />
        </CarouselSlide>

        <CarouselSlide index={1} scrollX={scrollX}>
          <HomeHeroCard
            image={require('../../assets/images/home-session.jpg')}
            title={t('home.startCardTitle')}
            meta={t('home.startCardMeta')}
            badge={t('home.startBadge')}
            accessibilityLabel={t('home.startA11y')}
            onPress={goSession}
          />
        </CarouselSlide>

        <CarouselSlide index={2} scrollX={scrollX} isLast>
          <HomeHeroCard
            image={require('../../assets/images/home-nearby.jpg')}
            title={t('home.nearbyCardTitle')}
            meta={t('home.nearbyCardMeta')}
            badge={isPremium ? t('home.nearbyBadgePremium') : t('home.nearbyBadge')}
            icon="explore"
            accessibilityLabel={t('home.nearbyA11y')}
            onPress={() => void goNearby()}
          />
        </CarouselSlide>
      </Animated.ScrollView>

      {joinError ? <Text style={styles.joinError}>{joinError}</Text> : null}

      <View style={styles.dots}>
        {[t('home.joinCardTitle'), t('home.startCta'), t('home.nearbyShort')].map((label, index) => (
          <CarouselDot
            key={label}
            index={index}
            scrollX={scrollX}
            label={label}
            onPress={() => snapToCenter(index as 0 | 1 | 2)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: SCREEN_WIDTH,
    alignSelf: 'center',
    gap: 14,
  },
  content: {
    paddingHorizontal: PEEK,
    alignItems: 'center',
  },
  slide: {
    width: CARD_WIDTH,
    height: homeHeroCardHeight,
    marginRight: CARD_GAP,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideLast: {
    marginRight: 0,
  },
  slideInner: {
    width: CARD_WIDTH,
    height: homeHeroCardHeight,
  },
  joinOverlay: {
    width: '100%',
    maxWidth: 280,
    paddingHorizontal: 4,
  },
  joinInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  joinInput: {
    flex: 1,
    minHeight: 56,
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 8,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  joinGo: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FlipOn.accent,
  },
  joinGoDisabled: { opacity: 0.35 },
  joinError: {
    fontSize: 13,
    color: FlipOn.danger,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: PEEK,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  dotHit: { padding: 6 },
  dot: {
    height: DOT_IDLE,
    borderRadius: DOT_IDLE / 2,
    backgroundColor: FlipOn.line,
  },
});
