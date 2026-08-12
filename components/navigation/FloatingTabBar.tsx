import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FlipOn, tabBarShadow } from '@/constants/flipon';
import { HISTORY_ICON } from '@/lib/history/constants';
import { useI18n } from '@/lib/i18n';

type TabName = 'index' | 'history' | 'profile';

const TAB_ICONS: Record<TabName, keyof typeof MaterialIcons.glyphMap> = {
  index: 'home',
  history: HISTORY_ICON,
  profile: 'person',
};

const TAB_LABEL_KEYS: Record<TabName, 'tabs.home' | 'tabs.history' | 'tabs.profile'> = {
  index: 'tabs.home',
  history: 'tabs.history',
  profile: 'tabs.profile',
};

/** Tab bar flottante centrée — pill glassmorphism (réf. GoWod). */
export function FloatingTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { t } = useI18n();

  const visibleRoutes = state.routes.filter((route) => route.name !== 'session');

  return (
    <View
      style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 10), pointerEvents: 'box-none' }]}>
      <View style={styles.pill} accessibilityRole="tablist">
        {Platform.OS === 'ios' ? (
          <BlurView intensity={55} tint="dark" style={StyleSheet.absoluteFillObject} />
        ) : (
          <View style={[StyleSheet.absoluteFillObject, styles.pillFallback]} />
        )}

        <View style={[styles.pillBorder, { pointerEvents: 'none' }]} />

        <View style={styles.row}>
          {visibleRoutes.map((route) => {
            const tabName = route.name as TabName;
            const routeIndex = state.routes.findIndex((r) => r.key === route.key);
            const isFocused = state.index === routeIndex;
            const icon = TAB_ICONS[tabName];
            const label = t(TAB_LABEL_KEYS[tabName]);

            const onPress = () => {
              if (process.env.EXPO_OS === 'ios') {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            const onLongPress = () => {
              navigation.emit({ type: 'tabLongPress', target: route.key });
            };

            return (
              <PlatformPressable
                key={route.key}
                accessibilityRole="tab"
                accessibilityState={{ selected: isFocused }}
                accessibilityLabel={label}
                onPress={onPress}
                onLongPress={onLongPress}
                style={styles.tabHit}>
                <View style={[styles.tabItem, isFocused && styles.tabItemActive]}>
                  <MaterialIcons
                    name={icon}
                    size={22}
                    color={isFocused ? FlipOn.ink : FlipOn.tabInactive}
                  />
                  <Text
                    style={[styles.tabLabel, isFocused && styles.tabLabelActive]}
                    numberOfLines={1}>
                    {label}
                  </Text>
                </View>
              </PlatformPressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  pill: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 999,
    overflow: 'hidden',
    ...tabBarShadow,
  },
  pillFallback: {
    backgroundColor: FlipOn.tabGlass,
  },
  pillBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: FlipOn.tabGlassBorder,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  tabHit: {
    flex: 1,
    alignItems: 'center',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    minWidth: 88,
  },
  tabItemActive: {
    backgroundColor: FlipOn.tabActive,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: FlipOn.tabInactive,
    letterSpacing: 0.1,
  },
  tabLabelActive: {
    color: FlipOn.ink,
    fontWeight: '700',
  },
});
