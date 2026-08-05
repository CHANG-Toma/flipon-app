import { ReactNode, useContext } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';

import { FlipOn } from '@/constants/flipon';

type Props = {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  contentStyle?: object;
};

export function Screen({ children, title, showBack = false, onBack, contentStyle }: Props) {
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
        {(showBack || title) && (
          <View style={styles.header}>
            {showBack ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Retour"
                onPress={() => {
                  if (onBack) {
                    onBack();
                    return;
                  }
                  if (router.canGoBack()) router.back();
                  else router.replace('/(tabs)');
                }}
                style={styles.backBtn}>
                <MaterialIcons name="arrow-back" size={22} color={FlipOn.ink} />
              </Pressable>
            ) : (
              <View style={styles.backSpacer} />
            )}
            {title ? <Text style={styles.headerTitle}>{title}</Text> : <View style={styles.backSpacer} />}
            <View style={styles.backSpacer} />
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
    paddingTop: 8,
    paddingBottom: 28,
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FlipOn.surface,
    borderWidth: 1,
    borderColor: FlipOn.line,
  },
  backSpacer: { width: 40 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: FlipOn.ink },
});
