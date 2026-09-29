// Serves: R11
import React, { useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, radius, spacing } from '../../src/theme/tokens';
import { Text } from '../../src/ui/Text';
import { Button } from '../../src/ui/Button';
import { ListenButton } from '../../src/ui/ListenButton';
import { ScreenShell } from '../../src/ui/ScreenShell';
import { useAppStore } from '../../src/store/useAppStore';
import { Lang, useT } from '../../src/i18n';
import { speak } from '../../src/services/speech';
import { MaterialPictograms } from '../../src/pictograms';

interface LangOption {
  id: Lang;
  label: string;
  subLabel: string;
  audioPrompt: string;
}

const LANGUAGES: LangOption[] = [
  {
    id: 'mr',
    label: 'मराठी',
    subLabel: 'नागपूर व विदर्भ',
    audioPrompt: 'तुमची भाषा निवडा',
  },
  {
    id: 'hi',
    label: 'हिंदी',
    subLabel: 'मध्य भारत',
    audioPrompt: 'अपनी भाषा चुनें',
  },
  {
    id: 'en',
    label: 'English',
    subLabel: 'Default format',
    audioPrompt: 'Choose your language',
  },
];

export default function LanguageScreen() {
  const router = useRouter();
  const { lang, setLang, autoPlayVoice } = useAppStore();
  const { t } = useT();

  useEffect(() => {
    if (autoPlayVoice) {
      speak('तुमची भाषा निवडा', 'mr');
    }
  }, [autoPlayVoice]);

  const handleSelectLanguage = (selectedLang: Lang) => {
    setLang(selectedLang);
  };

  const handleNext = () => {
    router.push('/onboarding/permissions');
  };

  return (
    <ScreenShell
      showTopBar={false}
      bottomAction={<Button title={t('next')} onPress={handleNext} variant="primary" />}
    >
      <View style={styles.header}>
        <View style={styles.appMark}>
          <MaterialPictograms.other size={48} />
        </View>
        <Text variant="title" weight="700" color={colors.ink} style={styles.title}>
          Kabadiwala Connect
        </Text>
        <Text variant="body" color={colors.inkMuted} style={styles.subtitle}>
          {t('chooseLanguage')}
        </Text>
      </View>

      <View style={styles.cardList}>
        {LANGUAGES.map((item) => {
          const isSelected = lang === item.id;
          return (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityLabel={`${item.label}, ${isSelected ? 'selected' : ''}`}
              onPress={() => handleSelectLanguage(item.id)}
              style={({ pressed }) => [
                styles.langCard,
                isSelected && styles.selectedCard,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.cardLeft}>
                <View
                  style={[
                    styles.radioCircle,
                    isSelected && styles.radioCircleSelected,
                  ]}
                >
                  {isSelected ? <View style={styles.radioInner} /> : null}
                </View>
                <View style={styles.textGroup}>
                  <Text
                    variant="title"
                    weight="700"
                    lang={item.id}
                    color={isSelected ? colors.onPrimaryContainer : colors.ink}
                  >
                    {item.label}
                  </Text>
                  <Text variant="caption" color={colors.inkMuted}>
                    {item.subLabel}
                  </Text>
                </View>
              </View>

              <ListenButton
                textToSpeak={item.audioPrompt}
                lang={item.id}
                size={22}
              />
            </Pressable>
          );
        })}
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
    gap: spacing.xs,
  },
  appMark: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
    backgroundColor: colors.primaryContainer,
    borderWidth: 1,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
  cardList: {
    gap: spacing.md,
  },
  langCard: {
    minHeight: 76,
    height: 76,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.outline,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedCard: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primary,
    borderWidth: 2,
  },
  pressed: {
    backgroundColor: colors.surfaceAlt,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.outline,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  textGroup: {
    gap: 2,
  },
});
