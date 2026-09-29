// Serves: R15
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Camera, MapPin, ShieldCheck } from 'phosphor-react-native';
import { useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { colors, radius, spacing } from '../../src/theme/tokens';
import { Text } from '../../src/ui/Text';
import { Button } from '../../src/ui/Button';
import { Card } from '../../src/ui/Card';
import { ScreenShell } from '../../src/ui/ScreenShell';
import { useT } from '../../src/i18n';

export default function PermissionsScreen() {
  const router = useRouter();
  const { t, lang } = useT();
  const [, requestCameraPermission] = useCameraPermissions();

  const handleAllow = async () => {
    try {
      await requestCameraPermission();
    } catch {
      // ignore
    }
    try {
      await Location.requestForegroundPermissionsAsync();
    } catch {
      // ignore
    }
    router.push('/onboarding/area');
  };

  const handleNotNow = () => {
    router.push('/onboarding/area');
  };

  return (
    <ScreenShell
      showTopBar={false}
      bottomAction={
        <View style={styles.buttonGroup}>
          <Button
            title={t('notNow')}
            onPress={handleNotNow}
            variant="text"
          />
          <Button
            title={t('allow')}
            onPress={handleAllow}
            variant="primary"
          />
        </View>
      }
    >
      <View style={styles.header}>
        <Text variant="title" weight="700" lang={lang} style={styles.title}>
          {t('permissionsTitle')}
        </Text>
      </View>

      <View style={styles.content}>
        {/* Camera Permission Row */}
        <View style={styles.permRow}>
          <View style={styles.iconBox}>
            <Camera size={28} color={colors.primary} weight="regular" />
          </View>
          <View style={styles.permTextGroup}>
            <Text variant="heading" weight="700" lang={lang}>
              {t('takePhoto')}
            </Text>
            <Text variant="body" color={colors.inkMuted} lang={lang}>
              {t('cameraPermDesc')}
            </Text>
          </View>
        </View>

        {/* Location Permission Row */}
        <View style={styles.permRow}>
          <View style={styles.iconBox}>
            <MapPin size={28} color={colors.primary} weight="regular" />
          </View>
          <View style={styles.permTextGroup}>
            <Text variant="heading" weight="700" lang={lang}>
              {t('bestBuyers')}
            </Text>
            <Text variant="body" color={colors.inkMuted} lang={lang}>
              {t('locationPermDesc')}
            </Text>
          </View>
        </View>

        {/* Privacy Promise Card */}
        <Card variant="primaryContainer" style={styles.promiseCard}>
          <View style={styles.promiseHeader}>
            <ShieldCheck size={24} color={colors.primary} weight="fill" />
            <Text variant="label" weight="700" color={colors.primary} lang={lang}>
              Privacy Promise
            </Text>
          </View>
          <Text variant="bodySmall" color={colors.ink} lang={lang} style={styles.promiseText}>
            {t('privacyPromise')}
          </Text>
        </Card>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  title: {
    lineHeight: 32,
  },
  content: {
    gap: spacing.lg,
  },
  permRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.outline,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permTextGroup: {
    flex: 1,
    gap: 4,
  },
  promiseCard: {
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  promiseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  promiseText: {
    lineHeight: 22,
  },
  buttonGroup: {
    gap: spacing.xs,
    width: '100%',
  },
});
