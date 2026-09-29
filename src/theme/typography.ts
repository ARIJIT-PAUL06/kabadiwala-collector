

// Serves: R11, R13

export type TypographyVariant =
  | 'display'
  | 'title'
  | 'heading'
  | 'body'
  | 'bodySmall'
  | 'label'
  | 'caption';

export interface TypeScale {
  fontSize: number;
  lineHeightEn: number;
  lineHeightDevanagari: number;
  fontWeight: '400' | '500' | '700';
}

export const typeScale: Record<TypographyVariant, TypeScale> = {
  display: {
    fontSize: 36,
    lineHeightEn: 44,
    lineHeightDevanagari: 54,
    fontWeight: '700',
  },
  title: {
    fontSize: 24,
    lineHeightEn: 32,
    lineHeightDevanagari: 36,
    fontWeight: '700',
  },
  heading: {
    fontSize: 20,
    lineHeightEn: 28,
    lineHeightDevanagari: 30,
    fontWeight: '500',
  },
  body: {
    fontSize: 18,
    lineHeightEn: 26,
    lineHeightDevanagari: 28,
    fontWeight: '400',
  },
  bodySmall: {
    fontSize: 16,
    lineHeightEn: 24,
    lineHeightDevanagari: 26,
    fontWeight: '400',
  },
  label: {
    fontSize: 16,
    lineHeightEn: 20,
    lineHeightDevanagari: 24,
    fontWeight: '500',
  },
  caption: {
    fontSize: 14,
    lineHeightEn: 18,
    lineHeightDevanagari: 22,
    fontWeight: '400',
  },
};

export const getFontFamily = (lang: 'en' | 'hi' | 'mr', weight: '400' | '500' | '700'): string => {
  const isDevanagari = lang === 'hi' || lang === 'mr';
  if (isDevanagari) {
    if (weight === '700') return 'NotoSansDevanagari_700Bold';
    if (weight === '500') return 'NotoSansDevanagari_500Medium';
    return 'NotoSansDevanagari_400Regular';
  }
  if (weight === '700') return 'NotoSans_700Bold';
  if (weight === '500') return 'NotoSans_500Medium';
  return 'NotoSans_400Regular';
};
