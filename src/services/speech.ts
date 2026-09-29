// Serves: R06, R11
import * as Speech from 'expo-speech';
import { Lang } from '../i18n';

// TODO(audio): native speaker recordings will be loaded here
const recordedClips: Record<string, string> = {};

let missingVoiceCallback: ((lang: Lang) => void) | null = null;
let speechRate = 0.9;

export const setMissingVoiceCallback = (cb: (lang: Lang) => void): void => {
  missingVoiceCallback = cb;
};

export const setSpeechRate = (rate: number): void => {
  speechRate = Math.max(0.7, Math.min(1.1, rate));
};

export const getSpeechRate = (): number => speechRate;

export const isSpeaking = async (): Promise<boolean> => {
  try {
    return await Speech.isSpeakingAsync();
  } catch {
    return false;
  }
};

export const stopSpeaking = async (): Promise<void> => {
  try {
    await Speech.stop();
  } catch {
    // no-op
  }
};

export const speak = async (
  text: string,
  lang: Lang = 'mr',
  audioKey?: string,
): Promise<void> => {
  try {
    // 1. Check if a pre-recorded native speaker clip exists
    if (audioKey && recordedClips[audioKey]) {
      // TODO(audio): Play native clip via sound player
      return;
    }

    // 2. Stop any ongoing speech
    await stopSpeaking();

    // 3. Resolve locale tag
    const voiceLang = lang === 'mr' ? 'mr-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN';

    // 4. Check available voices if possible
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      if (voices && voices.length > 0) {
        const hasMatchingVoice = voices.some((v) =>
          v.language.toLowerCase().startsWith(lang),
        );
        if (!hasMatchingVoice) {
          if (missingVoiceCallback) {
            missingVoiceCallback(lang);
          }
          // Do not silently speak another language
          return;
        }
      }
    } catch {
      // getAvailableVoicesAsync not supported on all web browsers; proceed to Speech.speak
    }

    // 5. Speak text with configured rate
    Speech.speak(text, {
      language: voiceLang,
      rate: speechRate,
    });
  } catch {
    // Silently handle audio subsystem errors without crashing app
  }
};

export const speechService = {
  speak,
  stopSpeaking,
  setSpeechRate,
  isSpeaking,
};

