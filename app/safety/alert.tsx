// Serves: R10, R11
import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Warning } from 'phosphor-react-native';

import { ScreenShell } from '../../src/ui/ScreenShell';
import { TopBar } from '../../src/ui/TopBar';
import { Text } from '../../src/ui/Text';
import { Button } from '../../src/ui/Button';
import { ListenButton } from '../../src/ui/ListenButton';
import { Banner } from '../../src/ui/Banner';
import { tokens } from '../../src/theme/tokens';
import { useT } from '../../src/i18n';
import { speak } from '../../src/services/speech';
import { useAppStore } from '../../src/store/useAppStore';
import { BatteryCare, NoBreakCrt } from '../../src/pictograms/safety';

export default function SafetyAlertScreen() {
  const { t, lang } = useT();
  const autoPlay = useAppStore((s) => s.autoPlayVoice);
  const params = useLocalSearchParams<{ hazard?: string; returnTo?: string }>();

  const isBattery = params.hazard === 'battery';
  const warningText = isBattery ? t('safeBattery') : t('safeNoBreakCrt');
  const returnTo = params.returnTo || '/sell/weight';

  useEffect(() => {
    if (autoPlay) {
      speak(`${t('hazardWarning')}. ${warningText}`, lang);
    }
  }, [autoPlay, lang, t, warningText]);

  const handleAcknowledge = () => {
    router.replace(returnTo as '/sell/weight');
  };

  return (
    <ScreenShell>
      <TopBar title={t('hazardWarning')} onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.content}>
        <Banner
          type="danger"
          message={t('hazardSafePrompt')}
          style={styles.banner}
        />

        <View style={styles.card}>
          <View style={styles.pictogramWrap}>
            {isBattery ? <BatteryCare size={96} /> : <NoBreakCrt size={96} />}
          </View>

          <View style={styles.textWrap}>
            <View style={styles.warningTitleRow}>
              <Warning size={28} color={tokens.danger} weight="bold" />
              <Text variant="title" color={tokens.danger} style={styles.warningTitle}>
                {t('hazardWarning')}
              </Text>
            </View>

            <Text variant="heading" style={styles.guideline}>
              {warningText}
            </Text>

            <View style={styles.listenRow}>
              <ListenButton textToSpeak={`${t('hazardWarning')}. ${warningText}`} lang={lang} />
              <Text variant="bodySmall" color={tokens.inkMuted}>
                {t('listen')}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={t('iUnderstand')}
          variant="primary"
          onPress={handleAcknowledge}
        />
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  banner: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: tokens.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: tokens.danger,
    padding: 24,
    alignItems: 'center',
  },
  pictogramWrap: {
    marginBottom: 20,
  },
  textWrap: {
    width: '100%',
    alignItems: 'center',
  },
  warningTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  warningTitle: {
    fontSize: 22,
  },
  guideline: {
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 28,
  },
  listenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: tokens.surfaceAlt,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: tokens.paper,
  },
});
