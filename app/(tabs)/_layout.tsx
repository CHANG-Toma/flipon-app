import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { FloatingTabBar } from '@/components/navigation/FloatingTabBar';
import { useI18n } from '@/lib/i18n';

export default function TabLayout() {
  const { t } = useI18n();

  return (
    <View style={styles.root}>
      <Tabs
        tabBar={(props) => <FloatingTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: t('tabs.home'),
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: t('tabs.history'),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: t('tabs.profile'),
          }}
        />
        <Tabs.Screen
          name="session"
          options={{
            href: null,
            title: t('tabs.newSession'),
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
