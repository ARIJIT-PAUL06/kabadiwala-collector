// Serves: R01, R02, R11, R16
import React, { useMemo, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Info } from 'phosphor-react-native';

import { ScreenShell } from '../../src/ui/ScreenShell';
import { TopBar } from '../../src/ui/TopBar';
import { Text } from '../../src/ui/Text';
import { Button } from '../../src/ui/Button';
import { StepIndicator } from '../../src/ui/StepIndicator';
import { MoneyText, formatIndianRupees } from '../../src/ui/MoneyText';
import { ListenButton } from '../../src/ui/ListenButton';
import { Chip } from '../../src/ui/Chip';
import { tokens } from '../../src/theme/tokens';
import { useT, formatKg } from '../../src/i18n';
import { useLotStore } from '../../src/store/useLotStore';
import { useAppStore } from '../../src/store/useAppStore';
import { generateSeedPrices } from '../../src/data/seed/prices';
import { calculateFairValue } from '../../src/domain/valuation';

export default function SellValueScreen() {
  const { t, lang } = useT();
  const userDistrict = useAppStore((s) => s.profile?.district) || 'Nagpur';
  const userLocality = useAppStore((s) => s.profile?.locality) || 'Itwari';
  const { activeDraft, updateDraft, saveDraft } = useLotStore();

  const prices = useMemo(() => generateSeedPrices(), []);

  const valuation = useMemo(() => {
    if (!activeDraft || activeDraft.items.length === 0) {
      return null;
    }
    return calculateFairValue(activeDraft.items, prices, userDistrict);
  }, [activeDraft, prices, userDistrict]);

  useEffect(() => {
    if (
      activeDraft &&
      valuation &&
      (activeDraft.status !== 'VALUED' ||
        activeDraft.estimate?.low !== valuation.low ||
        activeDraft.estimate?.high !== valuation.high)
    ) {
      const now = new Date().toISOString();
      updateDraft({
        status: 'VALUED',
        estimate: {
          low: valuation.low,
          high: valuation.high,
          basis: valuation.isWiderArea ? 'wider_area' : 'district',
          computedAt: now,
        },
      });
      saveDraft();
    }
  }, [activeDraft, valuation, updateDraft, saveDraft]);

  const handleFindBuyers = () => {
    saveDraft();
    router.push('/sell/buyers');
  };

  if (!valuation || !activeDraft) {
    return (
      <ScreenShell>
        <TopBar title={t('fairValue')} onBack={() => router.back()} />
        <View style={styles.emptyContainer}>
          <Text variant="body">{t('noLotsYet')}</Text>
        </View>
      </ScreenShell>
    );
  }

  const spokenRange = t('estimatedValueRange', {
    low: formatIndianRupees(valuation.low),
    high: formatIndianRupees(valuation.high),
  });

  return (
    <ScreenShell>
      <TopBar title={t('fairValue')} onBack={() => router.back()} />

      <View style={styles.stepContainer}>
        <StepIndicator currentStep={5} totalSteps={5} lang={lang} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Fair Value Range Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <Text variant="heading" color={tokens.inkMuted}>
              {t('fairValue')}
            </Text>
            <ListenButton textToSpeak={`${t('fairValue')}. ${spokenRange}`} lang={lang} />
          </View>

          <View style={styles.moneyRow}>
            <MoneyText range={[valuation.low, valuation.high]} variant="display" />
          </View>

          <Text variant="bodySmall" color={tokens.inkMuted} style={styles.heroSub}>
            Estimated total before buyer negotiation
          </Text>
        </View>

        {/* Per-item Breakdown */}
        <View style={styles.breakdownSection}>
          <Text variant="label" color={tokens.inkMuted} style={styles.sectionTitle}>
            Breakdown by item:
          </Text>

          {valuation.items.map((item) => {
            const isKg = item.materialId !== 'crt' && item.materialId !== 'lcd';
            const qtyStr = isKg
              ? formatKg(item.qtyLow === item.qtyHigh ? item.qtyLow : item.qtyHigh, lang)
              : `${item.qtyHigh} ${t('pieces')}`;

            const matName = t(
              item.materialId === 'crt'
                ? 'matCrt'
                : item.materialId === 'lcd'
                ? 'matLcd'
                : item.materialId === 'pcb'
                ? 'matPcb'
                : item.materialId === 'cable'
                ? 'matCable'
                : item.materialId === 'battery'
                ? 'matBattery'
                : item.materialId === 'motor'
                ? 'matMotor'
                : item.materialId === 'magnet'
                ? 'matMagnet'
                : item.materialId === 'plastic'
                ? 'matPlastic'
                : 'matOther',
            );

            return (
              <View key={item.itemId} style={styles.breakdownRow}>
                <View style={styles.breakdownLeft}>
                  <Text variant="body" weight="700">
                    {matName}
                  </Text>
                  <Text variant="bodySmall" color={tokens.inkMuted}>
                    {qtyStr} · {Math.round(item.factor * 100)}% factor
                  </Text>
                </View>
                <View style={styles.breakdownRight}>
                  <MoneyText range={[item.low, item.high]} variant="body" />
                  <Text variant="bodySmall" color={tokens.inkMuted}>
                    ₹{item.rateLow}–₹{item.rateHigh}/{isKg ? 'kg' : 'pc'}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Source & Transparency Info */}
        <View style={styles.sourceBox}>
          <View style={styles.sourceRow}>
            <Info size={18} color={tokens.info} />
            <Text variant="bodySmall" color={tokens.inkMuted} style={styles.sourceText}>
              {t('basedOn', {
                n: valuation.n,
                place: userLocality,
              })}
            </Text>
          </View>

          {valuation.isWiderArea && (
            <Text variant="bodySmall" color={tokens.warning} style={styles.widerNote}>
              * {t('widerAreaNote')}
            </Text>
          )}

          <View style={styles.tagRow}>
            <Chip label={t('demoData')} selected={false} />
            <Text variant="bodySmall" color={tokens.inkMuted}>
              Updated: {valuation.freshestDate}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={t('findBuyers')}
          variant="primary"
          onPress={handleFindBuyers}
        />
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  stepContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  heroCard: {
    backgroundColor: tokens.moneyContainer,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1.5,
    borderColor: tokens.money,
    marginBottom: 20,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  moneyRow: {
    marginBottom: 8,
  },
  heroSub: {
    marginTop: 4,
  },
  breakdownSection: {
    backgroundColor: tokens.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: tokens.outline,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: tokens.outline,
  },
  breakdownLeft: {
    flex: 1,
  },
  breakdownRight: {
    alignItems: 'flex-end',
  },
  sourceBox: {
    backgroundColor: tokens.surfaceAlt,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: tokens.outline,
    gap: 8,
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sourceText: {
    flex: 1,
    lineHeight: 18,
  },
  widerNote: {
    fontStyle: 'italic',
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: tokens.paper,
  },
});
