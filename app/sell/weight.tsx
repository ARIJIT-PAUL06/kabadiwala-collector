// Serves: R01, R11, R13
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';

import { ScreenShell } from '../../src/ui/ScreenShell';
import { TopBar } from '../../src/ui/TopBar';
import { Text } from '../../src/ui/Text';
import { Button } from '../../src/ui/Button';
import { StepIndicator } from '../../src/ui/StepIndicator';
import { Stepper } from '../../src/ui/Stepper';
import { ListenButton } from '../../src/ui/ListenButton';
import { Chip } from '../../src/ui/Chip';
import { tokens } from '../../src/theme/tokens';
import { useT, formatKg } from '../../src/i18n';
import { useLotStore } from '../../src/store/useLotStore';
import { LotItem } from '../../src/domain/types';
import { WEIGHT_PRESETS } from '../../src/domain/valuation';

export default function SellWeightScreen() {
  const { t, lang } = useT();
  const { activeDraft, updateDraft, saveDraft } = useLotStore();

  const [items, setItems] = useState<LotItem[]>(() => activeDraft?.items || []);

  const updateItemQty = (index: number, newQty: number) => {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      qty: newQty,
      qtyRange: undefined, // Clears preset range when user explicitly steps
    };
    setItems(updated);
  };

  const applyPreset = (index: number, presetKey: 'smallBag' | 'sack' | 'handcart') => {
    const range = WEIGHT_PRESETS[presetKey];
    const avg = (range[0] + range[1]) / 2;
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      qty: avg,
      qtyRange: range,
    };
    setItems(updated);
  };

  const handleNext = () => {
    updateDraft({ items });
    saveDraft();
    router.push('/sell/condition');
  };

  return (
    <ScreenShell>
      <TopBar title={t('sell')} onBack={() => router.back()} />

      <View style={styles.stepContainer}>
        <StepIndicator currentStep={3} totalSteps={5} lang={lang} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text variant="heading" style={styles.title}>
              {t('weight')}
            </Text>
            <Text variant="body" color={tokens.inkMuted}>
              Enter approximate weight or piece count
            </Text>
          </View>
          <ListenButton textToSpeak={`${t('weight')}. How much do you have?`} lang={lang} />
        </View>

        {items.map((item, idx) => {
          const isKg = item.unit === 'kg';
          const spokenQty = item.qtyRange
            ? `${item.qtyRange[0]} to ${item.qtyRange[1]} kg`
            : isKg
            ? formatKg(item.qty, lang)
            : `${item.qty} ${t('pieces')}`;

          return (
            <View key={item.id} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <View>
                  <Text variant="heading" style={styles.itemTitle}>
                    {t(
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
                    )}
                  </Text>
                  {item.qtyRange && (
                    <Text variant="bodySmall" color={tokens.primary} weight="700">
                      Approx: {item.qtyRange[0]}–{item.qtyRange[1]} kg
                    </Text>
                  )}
                </View>
                <ListenButton textToSpeak={spokenQty} lang={lang} />
              </View>

              {/* Stepper Control */}
              <View style={styles.stepperWrap}>
                <Stepper
                  value={item.qty}
                  onChange={(val) => updateItemQty(idx, val)}
                  step={isKg ? 0.5 : 1}
                  largeStep={isKg ? 5 : undefined}
                  min={isKg ? 0.5 : 1}
                  unit={isKg ? 'kg' : t('pieces')}
                />
              </View>

              {/* Presets Row for kg units */}
              {isKg && (
                <View style={styles.presetsBox}>
                  <Text variant="bodySmall" color={tokens.inkMuted} style={styles.presetsLabel}>
                    Quick estimate (presets):
                  </Text>
                  <View style={styles.chipsRow}>
                    <Chip
                      label={`${t('smallBag')} ~2kg`}
                      selected={
                        item.qtyRange?.[0] === WEIGHT_PRESETS.smallBag[0] &&
                        item.qtyRange?.[1] === WEIGHT_PRESETS.smallBag[1]
                      }
                      onPress={() => applyPreset(idx, 'smallBag')}
                    />
                    <Chip
                      label={`${t('sack')} ~10kg`}
                      selected={
                        item.qtyRange?.[0] === WEIGHT_PRESETS.sack[0] &&
                        item.qtyRange?.[1] === WEIGHT_PRESETS.sack[1]
                      }
                      onPress={() => applyPreset(idx, 'sack')}
                    />
                    <Chip
                      label={`${t('handcart')} ~35kg`}
                      selected={
                        item.qtyRange?.[0] === WEIGHT_PRESETS.handcart[0] &&
                        item.qtyRange?.[1] === WEIGHT_PRESETS.handcart[1]
                      }
                      onPress={() => applyPreset(idx, 'handcart')}
                    />
                  </View>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={t('next')}
          variant="primary"
          onPress={handleNext}
          disabled={items.length === 0}
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerText: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    marginBottom: 4,
  },
  itemCard: {
    backgroundColor: tokens.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: tokens.outline,
    padding: 16,
    marginBottom: 16,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  itemTitle: {
    fontSize: 18,
  },
  stepperWrap: {
    alignItems: 'center',
    marginBottom: 16,
  },
  presetsBox: {
    borderTopWidth: 1,
    borderTopColor: tokens.outline,
    paddingTop: 12,
  },
  presetsLabel: {
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: tokens.paper,
  },
});
