// Serves: R11, R12, R13
import React, { useEffect } from 'react';
import { View, StyleSheet, Platform, StatusBar } from 'react-native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  NotoSans_400Regular,
  NotoSans_500Medium,
  NotoSans_700Bold,
} from '@expo-google-fonts/noto-sans';
import {
  NotoSansDevanagari_400Regular,
  NotoSansDevanagari_500Medium,
  NotoSansDevanagari_700Bold,
} from '@expo-google-fonts/noto-sans-devanagari';
import { colors } from '../src/theme/tokens';
import { Text } from '../src/ui/Text';
import { ErrorBoundary } from '../src/ui/ErrorBoundary';

// Keep splash visible while fonts load
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    NotoSans_400Regular,
    NotoSans_500Medium,
    NotoSans_700Bold,
    NotoSansDevanagari_400Regular,
    NotoSansDevanagari_500Medium,
    NotoSansDevanagari_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.paper} />
      {Platform.OS === 'web' && (
        <View style={styles.webNotice}>
          <Text variant="caption" color={colors.inkMuted} style={styles.webNoticeText}>
            Best on Android — this is the web demo (SIH PS: SIH26229)
          </Text>
        </View>
      )}
      <View style={styles.content}>
        <ErrorBoundary>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.paper },
              animation: 'none',
            }}
          />
        </ErrorBoundary>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.paper,
    alignItems: 'center',
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: 500, // Mobile container on web
    backgroundColor: colors.paper,
  },
  webNotice: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: colors.infoContainer,
    borderBottomWidth: 1,
    borderBottomColor: colors.outline,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  webNoticeText: {
    fontSize: 12,
    textAlign: 'center',
  },
});
