import { Tabs } from 'expo-router';
import React from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color }) => <MaterialIcons size={24} name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="session"
        options={{
          title: 'Session',
          tabBarIcon: ({ color }) => <MaterialIcons size={24} name="tune" color={color} />,
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: 'Activite',
          tabBarIcon: ({ color }) => <MaterialIcons size={24} name="explore" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color }) => <MaterialIcons size={24} name="person" color={color} />,
        }}
      />
      <Tabs.Screen
        name="vote"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="result"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="boost"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
