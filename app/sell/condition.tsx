// Serves: R01, R11
import { router } from 'expo-router';
import { Check, Plus, ShieldCheck, WarningCircle, Wrench } from 'phosphor-react-native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { Condition, LotItem } from '../../src/domain/types';
import { useT } from '../../src/i18n';
import { useLotStore } from '../../src/store/useLotStore';
import { tokens } from '../../src/theme/tokens';
import { Button } from '../../src/ui/Button';
import { ListenButton } from '../../src/ui/ListenButton';
import { ScreenShell } from '../../src/ui/ScreenShell';
import { StepIndicator } from '../../src/ui/StepIndicator';
import { Text } from '../../src/ui/Text';
import { TopBar } from '../../src/ui/TopBar';

interface ConditionOption {
  value: Condition;
  labelKey: 'condWhole' | 'condPartly' | 'condDamaged';
  multiplierText: string;
  Icon: React.ComponentType<{ size?: number; color?: string; weight?: any }>;
}

const CONDITION_OPTIONS: ConditionOption[] = [
  {
    value: 'whole',
    labelKey: 'condWhole',
    multiplierText: '100% full value',
    Icon: ShieldCheck,
  },
  {
    value: 'partly_opened',
    labelKey: 'condPartly',
    multiplierText: '85% value',
    Icon: Wrench,
  },
  {
    value: 'damaged',
    labelKey: 'condDamaged',
    multiplierText: '60% value',
    Icon: WarningCircle,
  },
];

export default function SellConditionScreen() {
  const { t, lang } = useT();
  const { activeDraft, updateDraft, saveDraft } = useLotStore();

  const [items, setItems] = useState<LotItem[]>(() => activeDraft?.items || []);

  const setItemCondition = (index: number, condition: Condition) => {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      condition,
    };
    setItems(updated);
  };

  const handleAddAnotherItem = () => {
    updateDraft({ items });
    saveDraft();
    router.push('/sell/category');
  };

  const handleSeeValue = () => {
    updateDraft({ items });
    saveDraft();
    router.push('/sell/value');
  };

  return (
    <ScreenShell>
      <TopBar title={t('sell')} onBack={() => router.back()} />

      <View style={styles.stepContainer}>
        <StepIndicator currentStep={4} totalSteps={5} lang={lang} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text variant="heading" style={styles.title}>
              {t('itemCondition')}
            </Text>
            <Text variant="body" color={tokens.inkMuted}>
              Pick the state of each item
            </Text>
          </View>
          <ListenButton textToSpeak={`${t('itemCondition')}. Pick the condition of your scrap.`} lang={lang} />
        </View>

        {items.map((item, idx) => (
          <View key={item.id} style={styles.itemBox}>
            <View style={styles.itemHeader}>
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
            </View>

            <View style={styles.conditionsList}>
              {CONDITION_OPTIONS.map((opt) => {
                const isSelected = item.condition === opt.value;
                const IconComponent = opt.Icon;
                const label = t(opt.labelKey);

                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.condCard, isSelected && styles.condCardSelected]}
                    onPress={() => setItemCondition(idx, opt.value)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                  >
                    <View style={styles.condIconWrap}>
                      <IconComponent
                        size={28}
                        color={isSelected ? tokens.primary : tokens.inkMuted}
                        weight={isSelected ? 'bold' : 'regular'}
                      />
                    </View>

                    <View style={styles.condInfo}>
                      <Text variant="label" weight="700" style={styles.condTitle}>
                        {label}
                      </Text>
                      <Text variant="bodySmall" color={tokens.inkMuted}>
                        {opt.multiplierText}
                      </Text>
                    </View>

                    {isSelected ? (
                      <View style={styles.radioSelected}>
                        <Check size={16} color={tokens.surface} weight="bold" />
                      </View>
                    ) : (
                      <View style={styles.radioUnselected} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        {/* Add Another Item Button */}
        <TouchableOpacity style={styles.addAnotherBtn} onPress={handleAddAnotherItem}>
          <Plus size={20} color={tokens.primary} weight="bold" />
          <Text variant="label" color={tokens.primary} weight="700">
            {t('addItem')}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={t('seeValue')}
          variant="primary"
          onPress={handleSeeValue}
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
  itemBox: {
    backgroundColor: tokens.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: tokens.outline,
    padding: 16,
    marginBottom: 16,
  },
  itemHeader: {
    marginBottom: 12,
  },
  itemTitle: {
    fontSize: 18,
  },
  conditionsList: {
    gap: 8,
  },
  condCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: tokens.outline,
    backgroundColor: tokens.surfaceAlt,
  },
  condCardSelected: {
    borderColor: tokens.primary,
    borderWidth: 2,
    backgroundColor: tokens.primaryContainer,
  },
  condIconWrap: {
    marginRight: 12,
  },
  condInfo: {
    flex: 1,
  },
  condTitle: {
    marginBottom: 2,
  },
  radioSelected: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: tokens.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioUnselected: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: tokens.outline,
  },
  addAnotherBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: tokens.primary,
    borderRadius: 12,
    backgroundColor: tokens.primaryContainer,
    gap: 8,
    marginTop: 8,
    marginBottom: 16,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: tokens.paper,
  },
});
