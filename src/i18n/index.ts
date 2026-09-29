// Serves: R11
import { useState, useEffect } from 'react';
import { en, TranslationKey } from './en';
import { hi } from './hi';
import { mr } from './mr';

export type Lang = 'mr' | 'hi' | 'en';

export const dictionaries: Record<Lang, Record<TranslationKey, string>> = {
  mr,
  hi,
  en,
};

let currentLanguage: Lang = 'mr'; // Nagpur first default
const listeners = new Set<(lang: Lang) => void>();

export const getLanguage = (): Lang => currentLanguage;

export const setLanguage = (lang: Lang): void => {
  currentLanguage = lang;
  listeners.forEach((listener) => listener(lang));
};

export const t = (
  key: TranslationKey,
  params?: Record<string, string | number>,
  langOverride?: Lang,
): string => {
  const activeLang = langOverride || currentLanguage;
  const dict = dictionaries[activeLang] || dictionaries.en;
  let text = dict[key] || dictionaries.en[key] || key;

  if (params) {
    Object.keys(params).forEach((paramKey) => {
      text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(params[paramKey]));
    });
  }

  return text;
};

export const useT = (): {
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  lang: Lang;
  setLang: (lang: Lang) => void;
} => {
  const [lang, setLangState] = useState<Lang>(currentLanguage);

  useEffect(() => {
    const handleLangChange = (newLang: Lang) => {
      setLangState(newLang);
    };
    listeners.add(handleLangChange);
    return () => {
      listeners.delete(handleLangChange);
    };
  }, []);

  return {
    t: (key, params) => t(key, params, lang),
    lang,
    setLang: (newLang: Lang) => setLanguage(newLang),
  };
};

// Formatters
export const formatMoney = (amount: number): string => {
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Math.round(amount));
  } catch {
    return `₹${Math.round(amount)}`;
  }
};

export const formatKg = (qty: number, lang: Lang = 'en'): string => {
  const cleanQty = Number(qty.toFixed(1));
  if (lang === 'mr') return `${cleanQty} किलो`;
  if (lang === 'hi') return `${cleanQty} किलो`;
  return `${cleanQty} kg`;
};

export const formatDate = (isoDate: string | Date, lang: Lang = 'en'): string => {
  try {
    const date = typeof isoDate === 'string' ? new Date(isoDate) : isoDate;
    const locale = lang === 'mr' ? 'mr-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN';
    return new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    const date = typeof isoDate === 'string' ? new Date(isoDate) : isoDate;
    return date.toLocaleDateString();
  }
};
