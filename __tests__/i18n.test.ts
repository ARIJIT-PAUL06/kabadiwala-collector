// Serves: R11
import { en, TranslationKey } from '../src/i18n/en';
import { hi } from '../src/i18n/hi';
import { mr } from '../src/i18n/mr';
import { t, setLanguage, formatMoney, formatKg } from '../src/i18n';

describe('M2 i18n Completeness & Formatting Test', () => {
  const allowedEqualTerms = new Set([
    'appName', // Kabadiwala Connect is a brand name
    'paidUpi', // Contains UPI
    'upiReferenceLast4', // UPI reference
    'upiSection', // UPI
    'enableUpi', // UPI
    'matCrt', // Contains CRT/TV
    'matLcd', // Contains LCD
    'matPcb', // Circuit board transliteration
  ]);

  it('ensures all keys in en exist in hi and mr and are non-empty', () => {
    const enKeys = Object.keys(en) as TranslationKey[];

    enKeys.forEach((key) => {
      const hiVal = hi[key];
      const mrVal = mr[key];

      expect(hiVal).toBeDefined();
      expect(mrVal).toBeDefined();
      expect(hiVal.trim().length).toBeGreaterThan(0);
      expect(mrVal.trim().length).toBeGreaterThan(0);

      // Unless explicitly allowed as an acronym/brand, Hindi and Marathi must not equal English
      if (!allowedEqualTerms.has(key)) {
        expect(hiVal).not.toBe(en[key]);
        expect(mrVal).not.toBe(en[key]);
      }
    });
  });

  it('interpolates parameters correctly with {name} syntax', () => {
    const textEn = t('basedOn', { n: 14, place: 'Itwari' }, 'en');
    expect(textEn).toBe('Based on 14 rates in Itwari, last 14 days');

    const textMr = t('basedOn', { n: 14, place: 'इतवारी' }, 'mr');
    expect(textMr).toBe('इतवारी मधील मागील 14 दिवसांच्या 14 भावांवर आधारित');
  });

  it('formats currency properly with Indian grouping', () => {
    const formatted = formatMoney(123450);
    expect(formatted).toContain('1,23,450');
    expect(formatted).toContain('₹');
  });

  it('formats kg units properly across languages', () => {
    expect(formatKg(12.5, 'en')).toBe('12.5 kg');
    expect(formatKg(12.5, 'mr')).toBe('12.5 किलो');
    expect(formatKg(12.5, 'hi')).toBe('12.5 किलो');
  });

  it('switches active language reactively', () => {
    setLanguage('mr');
    expect(t('sell')).toBe('विका');

    setLanguage('hi');
    expect(t('sell')).toBe('बेचें');

    setLanguage('en');
    expect(t('sell')).toBe('Sell');
  });
});
