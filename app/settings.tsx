// Serves: R11, R12, R14, R15, R16
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Switch, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Translate,
  SpeakerHigh,
  MapPin,
  QrCode,
  CloudCheck,
  CloudSlash,
  ArrowsClockwise,
  ShieldCheck,
  WarningCircle,
  DownloadSimple,
  Flask,
  Info,
  Check,
} from 'phosphor-react-native';
import { colors, radius, spacing } from '../src/theme/tokens';
import { Text } from '../src/ui/Text';
import { Card } from '../src/ui/Card';
import { Button } from '../src/ui/Button';
import { Chip } from '../src/ui/Chip';
import { ScreenShell } from '../src/ui/ScreenShell';
import { ListenButton } from '../src/ui/ListenButton';
import { useAppStore } from '../src/store/useAppStore';
import { useLotStore } from '../src/store/useLotStore';
import { useLedgerStore } from '../src/store/useLedgerStore';
import { useOutboxStore } from '../src/store/useOutboxStore';
import { useT, Lang, formatDate } from '../src/i18n';
import { speechService } from '../src/services/speech';
import { syncEngine } from '../src/sync/syncEngine';
import { verifyChain } from '../src/domain/handover';
import { exportLocalData } from '../src/utils/exportData';
import { NAGPUR_LOCALITIES, Locality } from '../src/data/seed/areas';

export default function SettingsScreen() {
  const router = useRouter();
  const {
    lang,
    setLang,
    autoPlayVoice,
    setAutoPlayVoice,
    speechRate,
    setSpeechRate,
    profile,
    updateProfile,
    upiEnabled,
    setUpiEnabled,
    demoMode,
    setDemoMode,
    simulateOffline,
    setSimulateOffline,
    resetAllData,
  } = useAppStore();

  const { lots, resetLots } = useLotStore();
  const { entries, resetLedger } = useLedgerStore();
  const { ops, clearOutbox } = useOutboxStore();
  const { t } = useT();

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string>('');
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [chainResult, setChainResult] = useState<{ valid: boolean; brokenAtRef?: string }>({ valid: true });

  // Cryptographic audit check
  useEffect(() => {
    let mounted = true;
    verifyChain(lots)
      .then((res) => {
        if (mounted) {
          setChainResult(res);
        }
      })
      .catch(() => {
        if (mounted) {
          setChainResult({ valid: false });
        }
      });
    return () => {
      mounted = false;
    };
  }, [lots]);

  const pendingCount = ops.length;
  const syncState = simulateOffline ? 'offline' : pendingCount > 0 ? 'pending' : 'synced';

  const handleLanguageChange = (newLang: Lang) => {
    setLang(newLang);
    const welcome = newLang === 'mr' ? 'मराठी भाषा निवडली' : newLang === 'hi' ? 'हिंदी भाषा चुनी गई' : 'English selected';
    void speechService.speak(welcome, newLang);
  };

  const handleSendNow = async () => {
    setIsSyncing(true);
    setSyncStatusMsg('');
    const res = await syncEngine.sync(true);
    setIsSyncing(false);
    if (res.success) {
      setSyncStatusMsg(t('syncSuccess'));
    } else {
      setSyncStatusMsg(res.error || t('syncError'));
    }
  };

  const handleExport = async (format: 'json' | 'csv') => {
    const ok = await exportLocalData(lots, entries, format);
    if (ok) {
      setExportNotice(t('exportSuccess'));
      setTimeout(() => setExportNotice(null), 3000);
    }
  };

  const handleDeleteAll = () => {
    const proceed = () => {
      resetLots();
      resetLedger();
      clearOutbox();
      resetAllData();
      Alert.alert(t('appName'), t('dataDeletedSuccess'));
      router.replace('/onboarding/language');
    };

    if (Platform.OS === 'web') {
      if (window.confirm(t('confirmDelete'))) {
        proceed();
      }
    } else {
      Alert.alert(
        t('deleteEverything'),
        t('confirmDelete'),
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: proceed },
        ],
        { cancelable: true },
      );
    }
  };

  const handleResetDemo = () => {
    resetLots();
    resetLedger();
    clearOutbox();
    setSimulateOffline(false);
    Alert.alert(t('appName'), t('demoResetSuccess'));
  };

  const lastSync = syncEngine.getLastSyncTime();

  return (
    <ScreenShell
      topBarProps={{
        title: t('settingsTitle'),
        showBack: true,
        onBack: () => router.back(),
        syncState,
        pendingSyncCount: pendingCount,
        lang,
      }}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Language Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Translate size={20} color={colors.ink} weight="bold" />
            <Text variant="heading" weight="700">
              {t('languageSection')}
            </Text>
          </View>

          <View style={styles.langGrid}>
            <Card
              style={[styles.langCard, lang === 'mr' && styles.langCardActive]}
              onPress={() => handleLanguageChange('mr')}
            >
              <View style={styles.langRow}>
                <Text variant="title" weight="700" lang="mr">
                  मराठी
                </Text>
                {lang === 'mr' ? (
                  <Check size={20} color={colors.primary} weight="bold" />
                ) : (
                  <ListenButton textToSpeak="मराठी" lang="mr" />
                )}
              </View>
            </Card>

            <Card
              style={[styles.langCard, lang === 'hi' && styles.langCardActive]}
              onPress={() => handleLanguageChange('hi')}
            >
              <View style={styles.langRow}>
                <Text variant="title" weight="700" lang="hi">
                  हिंदी
                </Text>
                {lang === 'hi' ? (
                  <Check size={20} color={colors.primary} weight="bold" />
                ) : (
                  <ListenButton textToSpeak="हिंदी" lang="hi" />
                )}
              </View>
            </Card>

            <Card
              style={[styles.langCard, lang === 'en' && styles.langCardActive]}
              onPress={() => handleLanguageChange('en')}
            >
              <View style={styles.langRow}>
                <Text variant="title" weight="700" lang="en">
                  English
                </Text>
                {lang === 'en' ? (
                  <Check size={20} color={colors.primary} weight="bold" />
                ) : (
                  <ListenButton textToSpeak="English" lang="en" />
                )}
              </View>
            </Card>
          </View>
        </View>

        {/* 2. Voice Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <SpeakerHigh size={20} color={colors.ink} weight="bold" />
            <Text variant="heading" weight="700">
              {t('voiceSection')}
            </Text>
          </View>

          <Card style={styles.settingRow}>
            <View style={styles.settingTextCol}>
              <Text variant="body" weight="700">
                {t('autoPlayVoice')}
              </Text>
              <Text variant="caption" color={colors.inkMuted}>
                {autoPlayVoice ? 'Enabled' : 'Disabled'}
              </Text>
            </View>
            <Switch
              value={autoPlayVoice}
              onValueChange={setAutoPlayVoice}
              trackColor={{ false: colors.surfaceAlt, true: colors.primary }}
              thumbColor={colors.paper}
            />
          </Card>

          <Card style={styles.settingRow}>
            <View style={styles.settingTextCol}>
              <Text variant="body" weight="700">
                {t('speechRate')}
              </Text>
              <Text variant="caption" color={colors.inkMuted}>
                {speechRate < 0.9 ? t('voiceSpeedSlow') : t('voiceSpeedNormal')}
              </Text>
            </View>
            <View style={styles.chipRow}>
              <Chip
                label={t('voiceSpeedSlow')}
                selected={speechRate < 0.9}
                onPress={() => setSpeechRate(0.75)}
              />
              <Chip
                label={t('voiceSpeedNormal')}
                selected={speechRate >= 0.9}
                onPress={() => setSpeechRate(0.9)}
              />
            </View>
          </Card>
        </View>

        {/* 3. My Area Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MapPin size={20} color={colors.ink} weight="bold" />
            <Text variant="heading" weight="700">
              {t('myAreaSection')}
            </Text>
          </View>

          <Card style={styles.areaCard}>
            <Text variant="body" weight="700">
              {profile?.district || 'Nagpur'} · {profile?.locality || 'Itwari'}
            </Text>
            <Text variant="caption" color={colors.inkMuted} style={styles.areaDesc}>
              Tap to switch your active scrap trading locality:
            </Text>
            <View style={styles.localityChips}>
              {NAGPUR_LOCALITIES.slice(0, 6).map((loc: Locality) => {
                const isSelected = profile?.locality === loc.nameEn;
                return (
                  <Chip
                    key={loc.id}
                    label={lang === 'mr' ? loc.nameMr : lang === 'hi' ? loc.nameHi : loc.nameEn}
                    selected={isSelected}
                    onPress={() => updateProfile({ locality: loc.nameEn })}
                  />
                );
              })}
            </View>
          </Card>
        </View>

        {/* 4. UPI Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <QrCode size={20} color={colors.ink} weight="bold" />
            <Text variant="heading" weight="700">
              {t('upiSection')}
            </Text>
          </View>

          <Card style={styles.settingRow}>
            <View style={styles.settingTextCol}>
              <Text variant="body" weight="700">
                {t('enableUpi')}
              </Text>
              <Text variant="caption" color={colors.inkMuted}>
                {upiEnabled ? 'UPI Enabled' : 'Cash Only (Default)'}
              </Text>
            </View>
            <Switch
              value={upiEnabled}
              onValueChange={setUpiEnabled}
              trackColor={{ false: colors.surfaceAlt, true: colors.primary }}
              thumbColor={colors.paper}
            />
          </Card>
        </View>

        {/* 5. Sync Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <CloudCheck size={20} color={colors.ink} weight="bold" />
            <Text variant="heading" weight="700">
              {t('syncSection')}
            </Text>
          </View>

          <Card style={styles.syncCard}>
            <View style={styles.syncStatusRow}>
              {simulateOffline ? (
                <CloudSlash size={24} color={colors.inkMuted} weight="bold" />
              ) : pendingCount > 0 ? (
                <ArrowsClockwise size={24} color={colors.warning} weight="bold" />
              ) : (
                <CloudCheck size={24} color={colors.success} weight="bold" />
              )}
              <View style={styles.syncStatusTextCol}>
                <Text variant="body" weight="700">
                  {simulateOffline
                    ? t('offlineSaved')
                    : pendingCount > 0
                    ? t('waitingToSend', { n: pendingCount })
                    : t('allSent')}
                </Text>
                <Text variant="caption" color={colors.inkMuted}>
                  {lastSync ? t('lastSyncTime', { time: formatDate(lastSync, lang) }) : t('neverSynced')}
                </Text>
              </View>
            </View>

            {/* Cryptographic hash chain indicator */}
            <View style={[styles.chainBanner, chainResult.valid ? styles.chainValid : styles.chainBroken]}>
              {chainResult.valid ? (
                <>
                  <ShieldCheck size={20} color={colors.success} weight="bold" />
                  <Text variant="caption" weight="700" color={colors.success}>
                    {t('recordsIntact')}
                  </Text>
                </>
              ) : (
                <>
                  <WarningCircle size={20} color={colors.danger} weight="bold" />
                  <Text variant="caption" weight="700" color={colors.danger}>
                    {t('recordsBroken', { ref: chainResult.brokenAtRef || 'KC-UNKNOWN' })}
                  </Text>
                </>
              )}
            </View>

            {syncStatusMsg ? (
              <Text variant="caption" color={colors.primary} style={styles.syncMsg}>
                {syncStatusMsg}
              </Text>
            ) : null}

            <Button
              title={t('sendNow')}
              variant="primary"
              loading={isSyncing}
              disabled={simulateOffline}
              onPress={handleSendNow}
              style={styles.sendNowBtn}
            />
          </Card>
        </View>

        {/* 6. My Data Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <DownloadSimple size={20} color={colors.ink} weight="bold" />
            <Text variant="heading" weight="700">
              {t('myStoredData')}
            </Text>
          </View>

          <Card style={styles.dataCard}>
            <Text variant="body" weight="700">
              {t('whatIsStored')}
            </Text>
            <Text variant="caption" color={colors.inkMuted} style={styles.dataDesc}>
              {t('storedItemsDesc')}
            </Text>

            <View style={styles.dataPills}>
              <View style={styles.pill}>
                <Text variant="caption" weight="700">
                  {lots.length} Lots
                </Text>
              </View>
              <View style={styles.pill}>
                <Text variant="caption" weight="700">
                  {entries.length} Receipts
                </Text>
              </View>
              <View style={styles.pill}>
                <Text variant="caption" weight="700">
                  {ops.length} In Outbox
                </Text>
              </View>
            </View>

            {exportNotice ? (
              <Text variant="caption" color={colors.success} style={styles.exportNotice}>
                {exportNotice}
              </Text>
            ) : null}

            <View style={styles.exportRow}>
              <Button
                title="Export JSON"
                variant="secondary"
                onPress={() => handleExport('json')}
                style={styles.exportBtn}
              />
              <Button
                title="Export CSV"
                variant="secondary"
                onPress={() => handleExport('csv')}
                style={styles.exportBtn}
              />
            </View>

            <Button
              title={t('deleteEverything')}
              variant="danger"
              onPress={handleDeleteAll}
              style={styles.deleteBtn}
            />
          </Card>
        </View>

        {/* 7. Demo Controls Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Flask size={20} color={colors.ink} weight="bold" />
            <Text variant="heading" weight="700">
              {t('demoSection')}
            </Text>
          </View>

          <Card style={styles.demoCard}>
            <View style={styles.demoTag}>
              <Text variant="caption" weight="700" color={colors.primary}>
                DEMO DATA — all prices and buyers are synthetic
              </Text>
            </View>

            <View style={styles.settingRowInner}>
              <View style={styles.settingTextCol}>
                <Text variant="body" weight="700">
                  {t('demoModeToggle')}
                </Text>
                <Text variant="caption" color={colors.inkMuted}>
                  Enables buyer handover simulator
                </Text>
              </View>
              <Switch
                value={demoMode}
                onValueChange={setDemoMode}
                trackColor={{ false: colors.surfaceAlt, true: colors.primary }}
                thumbColor={colors.paper}
              />
            </View>

            <View style={styles.settingRowInner}>
              <View style={styles.settingTextCol}>
                <Text variant="body" weight="700">
                  {t('simulateOffline')}
                </Text>
                <Text variant="caption" color={colors.inkMuted}>
                  Simulate no cellular signal
                </Text>
              </View>
              <Switch
                value={simulateOffline}
                onValueChange={setSimulateOffline}
                trackColor={{ false: colors.surfaceAlt, true: colors.primary }}
                thumbColor={colors.paper}
              />
            </View>

            <Button
              title={t('resetDemoData')}
              variant="secondary"
              onPress={handleResetDemo}
              style={styles.resetBtn}
            />
          </Card>
        </View>

        {/* 8. About Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Info size={20} color={colors.ink} weight="bold" />
            <Text variant="heading" weight="700">
              {t('aboutTitle')}
            </Text>
          </View>

          <Card style={styles.aboutCard}>
            <Text variant="body" weight="700">
              {t('aboutApp')}
            </Text>
            <Text variant="caption" color={colors.inkMuted} style={styles.aboutDesc}>
              {t('datasetSources')}
            </Text>
          </Card>
        </View>
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl * 2,
    gap: spacing.lg,
  },
  section: {
    gap: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  langGrid: {
    gap: spacing.sm,
  },
  langCard: {
    minHeight: 56,
    justifyContent: 'center',
  },
  langCardActive: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.surfaceAlt,
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  settingRowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.outline,
  },
  settingTextCol: {
    flex: 1,
    gap: 2,
  },
  chipRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  areaCard: {
    gap: spacing.sm,
  },
  areaDesc: {
    marginTop: 2,
  },
  localityChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  syncCard: {
    gap: spacing.md,
  },
  syncStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  syncStatusTextCol: {
    flex: 1,
    gap: 2,
  },
  chainBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
  },
  chainValid: {
    backgroundColor: '#EAF7EE',
  },
  chainBroken: {
    backgroundColor: '#FDECEC',
  },
  syncMsg: {
    marginTop: -4,
  },
  sendNowBtn: {
    marginTop: spacing.xs,
  },
  dataCard: {
    gap: spacing.sm,
  },
  dataDesc: {
    lineHeight: 18,
  },
  dataPills: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  pill: {
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.outline,
  },
  exportNotice: {
    marginTop: spacing.xs,
  },
  exportRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  exportBtn: {
    flex: 1,
  },
  deleteBtn: {
    marginTop: spacing.xs,
  },
  demoCard: {
    gap: spacing.sm,
  },
  demoTag: {
    backgroundColor: colors.surfaceAlt,
    padding: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.outline,
  },
  resetBtn: {
    marginTop: spacing.xs,
  },
  aboutCard: {
    gap: spacing.xs,
  },
  aboutDesc: {
    lineHeight: 18,
  },
});
