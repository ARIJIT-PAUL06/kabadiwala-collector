// Serves: R15
import React, { useState } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import * as Crypto from 'expo-crypto';
import { colors, radius, spacing } from '../../src/theme/tokens';
import { Text } from '../../src/ui/Text';
import { Button } from '../../src/ui/Button';
import { Chip } from '../../src/ui/Chip';
import { ScreenShell } from '../../src/ui/ScreenShell';
import { useAppStore } from '../../src/store/useAppStore';
import { useT } from '../../src/i18n';
import { repo } from '../../src/data/repo';
import { hashPhoneNumber } from '../../src/utils/hex';
import { CollectorProfile } from '../../src/domain/types';

export default function AreaScreen() {
  const router = useRouter();
  const { lang, setProfile } = useAppStore();
  const { t } = useT();

  const [selectedDistrict, setSelectedDistrict] = useState('Nagpur');
  const [selectedLocality, setSelectedLocality] = useState('itwari');
  const [role, setRole] = useState<'collector' | 'aggregator'>('collector');
  const [phoneNumber, setPhoneNumber] = useState('');

  const districts = repo.getDistricts();
  const currentDistrict = districts.find((d) => d.nameEn === selectedDistrict) || districts[0];

  const handleStart = async () => {
    let phoneHash: string | undefined;
    if (phoneNumber.trim().length >= 10) {
      phoneHash = await hashPhoneNumber(phoneNumber);
    }

    const profile: CollectorProfile = {
      id: Crypto.randomUUID(),
      lang,
      district: selectedDistrict,
      locality: selectedLocality,
      phoneHash,
      role,
      createdAt: new Date().toISOString(),
    };

    setProfile(profile);
    router.replace('/home');
  };

  return (
    <ScreenShell
      showTopBar={false}
      bottomAction={
        <Button
          title={t('start')}
          onPress={handleStart}
          variant="primary"
        />
      }
    >
      <View style={styles.header}>
        <Text variant="title" weight="700" lang={lang}>
          {t('whereDoYouWork')}
        </Text>
      </View>

      {/* District Selection */}
      <View style={styles.section}>
        <Text variant="label" weight="700" color={colors.inkMuted} lang={lang}>
          {t('selectDistrict')}
        </Text>
        <View style={styles.chipsRow}>
          {districts.map((d) => (
            <Chip
              key={d.id}
              label={lang === 'mr' ? d.nameMr : lang === 'hi' ? d.nameHi : d.nameEn}
              selected={selectedDistrict === d.nameEn}
              onPress={() => setSelectedDistrict(d.nameEn)}
            />
          ))}
        </View>
      </View>

      {/* Locality Selection */}
      <View style={styles.section}>
        <Text variant="label" weight="700" color={colors.inkMuted} lang={lang}>
          {t('selectLocality')}
        </Text>
        <View style={styles.localityGrid}>
          {currentDistrict.localities.map((loc) => (
            <Chip
              key={loc.id}
              label={lang === 'mr' ? loc.nameMr : lang === 'hi' ? loc.nameHi : loc.nameEn}
              selected={selectedLocality === loc.id}
              onPress={() => setSelectedLocality(loc.id)}
            />
          ))}
        </View>
      </View>

      {/* Role Selection */}
      <View style={styles.section}>
        <Text variant="label" weight="700" color={colors.inkMuted} lang={lang}>
          {t('yourRole')}
        </Text>
        <View style={styles.chipsRow}>
          <Chip
            label={t('collector')}
            selected={role === 'collector'}
            onPress={() => setRole('collector')}
          />
          <Chip
            label={t('aggregatorHub')}
            selected={role === 'aggregator'}
            onPress={() => setRole('aggregator')}
          />
        </View>
      </View>

      {/* Optional Phone Input (10 digits) */}
      <View style={styles.section}>
        <View style={styles.phoneHeader}>
          <Text variant="label" weight="700" color={colors.inkMuted} lang={lang}>
            {t('optionalPhone')}
          </Text>
          <Text variant="caption" color={colors.inkMuted} lang={lang}>
            {t('skip')}
          </Text>
        </View>
        <TextInput
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="numeric"
          maxLength={10}
          placeholder="9876543210"
          placeholderTextColor={colors.inkMuted}
          style={styles.phoneInput}
        />
        <Text variant="caption" color={colors.inkMuted} lang={lang}>
          {t('phoneHint')}
        </Text>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  section: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  localityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  phoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  phoneInput: {
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outline,
    paddingHorizontal: spacing.md,
    fontSize: 18,
    color: colors.ink,
  },
});
