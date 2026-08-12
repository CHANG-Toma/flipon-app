import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter, type Href } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { HomeHeroCard, homeHeroCardHeight } from '@/components/home/HomeHeroCard';
import { FlipOn } from '@/constants/flipon';
import { usePremiumContext } from '@/hooks/use-premium-context';
import { useI18n } from '@/lib/i18n';
import { normalizeSessionCode } from '@/lib/session-code';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_GAP = 12;
const CARD_WIDTH = SCREEN_WIDTH - 72;
const SIDE_INSET = (SCREEN_WIDTH - CARD_WIDTH) / 2;
const CENTER_OFFSET = CARD_WIDTH + CARD_GAP;

type Props = {
  joinCode: string;
  joinError: string | null;
  isPremium: boolean;
  onChangeCode: (code: string) => void;
  onJoin: () => void;
};

export function HomeCarousel({
  joinCode,
  joinError,
  isPremium,
  onChangeCode,
  onJoin,
}: Props) {
  const router = useRouter();
  const { t } = useI18n();
  const scrollRef = useRef<ScrollView>(null);
  const premium = usePremiumContext(isPremium);
  const canJoin = joinCode.trim().length > 0;
  const [activeIndex, setActiveIndex] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollRef.current?.scrollTo({ x: CENTER_OFFSET, animated: false });
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const snapToCenter = useCallback((index: 0 | 1 | 2) => {
    setActiveIndex(index);
    scrollRef.current?.scrollTo({
      x: index * CENTER_OFFSET,
      animated: true,
    });
  }, []);

  const onScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = event.nativeEvent.contentOffset.x;
    const index = Math.max(0, Math.min(2, Math.round(x / CENTER_OFFSET)));
    setActiveIndex(index);
    void Haptics.selectionAsync();
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
    <View style={styles.wrap}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={CENTER_OFFSET}
        snapToAlignment="start"
        disableIntervalMomentum
        contentContainerStyle={styles.content}
        onMomentumScrollEnd={onScrollEnd}
        onScrollEndDrag={onScrollEnd}>
        <View style={styles.slide}>
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
                    <MaterialIcons name="arrow-forward" size={20} color={FlipOn.onAccent} />
                  </Pressable>
                </View>
              </View>
            }
          />
        </View>

        <View style={styles.slide}>
          <HomeHeroCard
            image={require('../../assets/images/home-session.jpg')}
            title={t('home.startCardTitle')}
            meta={t('home.startCardMeta')}
            badge={t('home.startBadge')}
            accessibilityLabel={t('home.startA11y')}
            onPress={goSession}
          />
        </View>

        <View style={styles.slide}>
          <HomeHeroCard
            image={require('../../assets/images/home-nearby.jpg')}
            title={t('home.nearbyCardTitle')}
            meta={t('home.nearbyCardMeta')}
            badge={isPremium ? t('home.nearbyBadgePremium') : t('home.nearbyBadge')}
            icon="explore"
            accessibilityLabel={t('home.nearbyA11y')}
            onPress={() => void goNearby()}
          />
        </View>
      </ScrollView>

      {joinError ? <Text style={styles.joinError}>{joinError}</Text> : null}

      <View style={styles.dots}>
        {[t('home.joinCardTitle'), t('home.startCta'), t('home.nearbyShort')].map((label, index) => (
          <Pressable
            key={label}
            accessibilityRole="button"
            accessibilityLabel={label}
            onPress={() => snapToCenter(index as 0 | 1 | 2)}
            style={styles.dotHit}>
            <View style={[styles.dot, index === activeIndex && styles.dotActive]} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
    marginHorizontal: -20,
  },
  content: {
    paddingHorizontal: SIDE_INSET,
    gap: CARD_GAP,
  },
  slide: {
    width: CARD_WIDTH,
    height: homeHeroCardHeight,
  },
  joinOverlay: {
    width: '100%',
    paddingHorizontal: 4,
  },
  joinInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  joinInput: {
    flex: 1,
    minHeight: 48,
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 6,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  joinGo: {
    width: 48,
    height: 48,
    borderRadius: 14,
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
    paddingHorizontal: SIDE_INSET,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  dotHit: { padding: 6 },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: FlipOn.line,
  },
  dotActive: {
    width: 18,
    backgroundColor: FlipOn.accent,
  },
});
