import { ReactNode, useContext } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';

import { FlipOn } from '@/constants/flipon';
import { useI18n } from '@/lib/i18n';

type Props = {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  headerRight?: ReactNode;
  contentStyle?: object;
};

export function Screen({
  children,
  title,
  showBack = false,
  onBack,
  headerRight,
  contentStyle,
}: Props) {
  const { t } = useI18n();
  const router = useRouter();
  const tabBarHeight = useContext(BottomTabBarHeightContext) ?? 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.container,
          tabBarHeight > 0 ? { paddingBottom: 28 + tabBarHeight } : null,
          contentStyle,
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {(showBack || title || headerRight) && (
          <View style={styles.header}>
            {showBack ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('common.back')}

                onPress={() => {
                  if (onBack) {
                    onBack();
                    return;
                  }
                  if (router.canGoBack()) router.back();
                  else router.replace('/(tabs)');
                }}
                style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]}
                hitSlop={6}>
                <View style={styles.backBtnInner}>
                  <MaterialIcons name="arrow-back" size={18} color={FlipOn.ink} />
                </View>
              </Pressable>
            ) : (
              <View style={styles.backSpacer} />
            )}
            {title ? <Text style={styles.headerTitle}>{title}</Text> : <View style={styles.flexSpacer} />}
            {headerRight ?? <View style={styles.backSpacer} />}
          </View>
        )}
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: FlipOn.bg },
  scroll: { flex: 1 },
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 28,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FlipOn.soft,
    borderWidth: 1,
    borderColor: FlipOn.line,
  },
  backBtnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.94 }],
  },
  backSpacer: { width: 36 },
  flexSpacer: { flex: 1 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: FlipOn.ink, flex: 1, textAlign: 'center', letterSpacing: -0.2 },
});
