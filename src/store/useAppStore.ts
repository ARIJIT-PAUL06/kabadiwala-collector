// Serves: R11, R12, R14, R15, R16
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { appStorage } from './storage';
import { CollectorProfile, Lang } from '../domain/types';
import { setLanguage } from '../i18n';
import { setSpeechRate as setEngineSpeechRate } from '../services/speech';

export interface AppState {
  profile: CollectorProfile | null;
  lang: Lang;
  onboardingComplete: boolean;
  autoPlayVoice: boolean;
  speechRate: number;
  upiEnabled: boolean;
  demoMode: boolean;
  simulateOffline: boolean;

  // Actions
  setLang: (lang: Lang) => void;
  setProfile: (profile: CollectorProfile) => void;
  updateProfile: (partial: Partial<CollectorProfile>) => void;
  setOnboardingComplete: (complete: boolean) => void;
  setAutoPlayVoice: (enabled: boolean) => void;
  setSpeechRate: (rate: number) => void;
  setUpiEnabled: (enabled: boolean) => void;
  setDemoMode: (enabled: boolean) => void;
  setSimulateOffline: (simulate: boolean) => void;
  resetAllData: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      profile: null,
      lang: 'mr', // Nagpur-first default
      onboardingComplete: false,
      autoPlayVoice: true,
      speechRate: 0.9,
      upiEnabled: false, // Cash-first
      demoMode: true,
      simulateOffline: false,

      setLang: (lang) => {
        setLanguage(lang);
        set({ lang });
      },

      setProfile: (profile) => {
        set({ profile, onboardingComplete: true });
      },

      updateProfile: (partial) => {
        set((state) => ({
          profile: state.profile ? { ...state.profile, ...partial } : null,
        }));
      },

      setOnboardingComplete: (complete) => {
        set({ onboardingComplete: complete });
      },

      setAutoPlayVoice: (autoPlayVoice) => {
        set({ autoPlayVoice });
      },

      setSpeechRate: (speechRate) => {
        setEngineSpeechRate(speechRate);
        set({ speechRate });
      },

      setUpiEnabled: (upiEnabled) => {
        set({ upiEnabled });
      },

      setDemoMode: (demoMode) => {
        set({ demoMode });
      },

      setSimulateOffline: (simulateOffline) => {
        set({ simulateOffline });
      },

      resetAllData: () => {
        set({
          profile: null,
          onboardingComplete: false,
          lang: 'mr',
          upiEnabled: false,
          simulateOffline: false,
        });
      },
    }),
    {
      name: 'kabadiwala_app_store',
      version: 1,
      storage: createJSONStorage(() => appStorage),
      migrate: (persistedState, version) => {
        return persistedState as AppState;
      },
      onRehydrateStorage: () => (state) => {
        if (state?.lang) {
          setLanguage(state.lang);
        }
        if (state?.speechRate) {
          setEngineSpeechRate(state.speechRate);
        }
      },
    },
  ),
);
