// Serves: R06, R11, R13
import React, { useState } from 'react';
import { Pressable, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { SpeakerHigh, SpeakerSlash } from 'phosphor-react-native';
import * as Speech from 'expo-speech';
import { colors, radius } from '../theme/tokens';

export interface ListenButtonProps {
  textToSpeak: string;
  lang?: 'en' | 'hi' | 'mr';
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export const ListenButton: React.FC<ListenButtonProps> = ({
  textToSpeak,
  lang = 'en',
  size = 24,
  color = colors.primary,
  style,
  accessibilityLabel = 'Listen to audio',
}) => {
  const [speaking, setSpeaking] = useState(false);

  const handleSpeak = async () => {
    try {
      const isSpeaking = await Speech.isSpeakingAsync();
      if (isSpeaking) {
        await Speech.stop();
        setSpeaking(false);
        return;
      }

      setSpeaking(true);
      const voiceLang = lang === 'mr' ? 'mr-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN';
      Speech.speak(textToSpeak, {
        language: voiceLang,
        rate: 0.9,
        onDone: () => setSpeaking(false),
        onStopped: () => setSpeaking(false),
        onError: () => setSpeaking(false),
      });
    } catch {
      setSpeaking(false);
    }
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={handleSpeak}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.pressed,
        speaking && styles.speaking,
        style,
      ]}
      hitSlop={8}
    >
      {speaking ? (
        <SpeakerSlash size={size} color={colors.primaryPressed} weight="regular" />
      ) : (
        <SpeakerHigh size={size} color={color} weight="regular" />
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    minWidth: 44,
    minHeight: 44,
    width: 44,
    height: 44,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.outline,
  },
  pressed: {
    backgroundColor: colors.primaryContainer,
  },
  speaking: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primary,
  },
});
