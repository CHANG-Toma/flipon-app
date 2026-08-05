import { Tabs, usePathname, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { FlipOn } from '@/constants/flipon';
import { useColorScheme } from '@/hooks/use-color-scheme';

const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 88 : 68;

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  // Web: évite le warning "aria-hidden + focus" au changement d'onglet
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const active = document.activeElement as HTMLElement | null;
    if (active && active !== document.body && typeof active.blur === 'function') {
      active.blur();
    }
  }, [pathname]);

  const hideFab =
    pathname.includes('session') ||
    pathname.includes('vote') ||
    pathname.includes('result') ||
    pathname.includes('boost');

  return (
    <View style={styles.root}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].tabIconDefault,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabLabel,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Accueil',
            tabBarIcon: ({ color }) => <MaterialIcons size={24} name="home" color={color} />,
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: 'Historique',
            tabBarIcon: ({ color }) => <MaterialIcons size={24} name="history" color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profil',
            tabBarIcon: ({ color }) => <MaterialIcons size={24} name="person" color={color} />,
          }}
        />
        <Tabs.Screen name="session" options={{ href: null }} />
        <Tabs.Screen name="activity" options={{ href: null }} />
        <Tabs.Screen name="vote" options={{ href: null }} />
        <Tabs.Screen name="result" options={{ href: null }} />
        <Tabs.Screen name="boost" options={{ href: null }} />
        <Tabs.Screen name="explore" options={{ href: null }} />
      </Tabs>

      {!hideFab && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Nouvelle session"
          onPress={() => router.push('/(tabs)/session')}
          style={[
            styles.fab,
            {
              bottom: TAB_BAR_HEIGHT + Math.max(insets.bottom, 8),
            },
          ]}>
          <MaterialIcons size={28} name="add" color="#ffffff" />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  tabBar: {
    backgroundColor: FlipOn.surface,
    borderTopColor: FlipOn.line,
    borderTopWidth: 1,
    height: TAB_BAR_HEIGHT,
    paddingTop: 6,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 18,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: FlipOn.accent,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    elevation: 4,
  },
});
