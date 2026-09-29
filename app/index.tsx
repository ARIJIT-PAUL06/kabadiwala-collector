// Serves: R11, R15
import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../src/store/useAppStore';
import { colors } from '../src/theme/tokens';

export default function IndexScreen() {
  const router = useRouter();
  const { onboardingComplete } = useAppStore();

  useEffect(() => {
    // Navigate on next frame
    const timer = setTimeout(() => {
      if (onboardingComplete) {
        router.replace('/home');
      } else {
        router.replace('/onboarding/language');
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [onboardingComplete, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.paper,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
