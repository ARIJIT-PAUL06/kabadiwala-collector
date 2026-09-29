// Serves: R01, R05, R10, R11
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Check } from 'phosphor-react-native';

import { ScreenShell } from '../../src/ui/ScreenShell';
import { TopBar } from '../../src/ui/TopBar';
import { Text } from '../../src/ui/Text';
import { Button } from '../../src/ui/Button';
import { StepIndicator } from '../../src/ui/StepIndicator';
import { ListenButton } from '../../src/ui/ListenButton';
import { Chip } from '../../src/ui/Chip';
import { tokens } from '../../src/theme/tokens';
import { useT } from '../../src/i18n';
import { useLotStore } from '../../src/store/useLotStore';
import { MaterialId, LotItem, Unit } from '../../src/domain/types';
import { SEED_MATERIALS } from '../../src/data/seed/materials';
import { classifier, ClassifierResult } from '../../src/services/classifier';
import {
  CrtPictogram,
  LcdPictogram,
  PcbPictogram,
  CablePictogram,
  BatteryPictogram,
  MotorPictogram,
  MagnetPictogram,
  PlasticPictogram,
  OtherPictogram,
} from '../../src/pictograms';

interface MaterialOption {
  id: MaterialId;
  labelKey:
    | 'matCrt'
    | 'matLcd'
    | 'matPcb'
    | 'matCable'
    | 'matBattery'
    | 'matMotor'
    | 'matMagnet'
    | 'matPlastic'
    | 'matOther';
  unit: Unit;
  hazardous: boolean;
  Component: React.ComponentType<{ size?: number; color?: string; accentColor?: string }>;
}

const MATERIAL_OPTIONS: MaterialOption[] = [
  { id: 'crt', labelKey: 'matCrt', unit: 'piece', hazardous: true, Component: CrtPictogram },
  { id: 'lcd', labelKey: 'matLcd', unit: 'piece', hazardous: false, Component: LcdPictogram },
  { id: 'pcb', labelKey: 'matPcb', unit: 'kg', hazardous: false, Component: PcbPictogram },
  { id: 'cable', labelKey: 'matCable', unit: 'kg', hazardous: false, Component: CablePictogram },
  { id: 'battery', labelKey: 'matBattery', unit: 'kg', hazardous: true, Component: BatteryPictogram },
  { id: 'motor', labelKey: 'matMotor', unit: 'kg', hazardous: false, Component: MotorPictogram },
  { id: 'magnet', labelKey: 'matMagnet', unit: 'kg', hazardous: false, Component: MagnetPictogram },
  { id: 'plastic', labelKey: 'matPlastic', unit: 'kg', hazardous: false, Component: PlasticPictogram },
  { id: 'other', labelKey: 'matOther', unit: 'kg', hazardous: false, Component: OtherPictogram },
];

export default function SellCategoryScreen() {
  const { t, lang } = useT();
  const { activeDraft, updateDraft, saveDraft } = useLotStore();

  const [selectedMaterials, setSelectedMaterials] = useState<MaterialId[]>(() => {
    if (activeDraft && activeDraft.items.length > 0) {
      return Array.from(new Set(activeDraft.items.map((i) => i.materialId)));
    }
    return [];
  });
  const [pcbGrade, setPcbGrade] = useState<'low_grade' | 'mid_grade' | 'high_grade'>(() => {
    const existingPcb = activeDraft?.items.find((i) => i.materialId === 'pcb');
    return (existingPcb?.subCategory as 'low_grade' | 'mid_grade' | 'high_grade') || 'mid_grade';
  });
  const [classifierSuggestion, setClassifierSuggestion] = useState<ClassifierResult | null>(null);

  // Check classifier if photo exists
  useEffect(() => {
    if (activeDraft && activeDraft.photos.length > 0) {
      classifier.suggest(activeDraft.photos[0]).then((res) => {
        if (res && res.confidence >= 0.7) {
          setClassifierSuggestion(res);
        }
      });
    }
  }, [activeDraft]);

  const toggleMaterial = (id: MaterialId) => {
    if (selectedMaterials.includes(id)) {
      setSelectedMaterials(selectedMaterials.filter((m) => m !== id));
    } else {
      setSelectedMaterials([...selectedMaterials, id]);
    }
  };

  const handleNext = () => {
    if (selectedMaterials.length === 0) return;

    // Build or update draft items
    const currentItems: LotItem[] = selectedMaterials.map((matId) => {
      const existing = activeDraft?.items.find((i) => i.materialId === matId);
      const seed = SEED_MATERIALS.find((m) => m.id === matId);
      const unit = seed ? seed.unit : 'kg';

      return {
        id: existing?.id || `item-${matId}`,
        materialId: matId,
        subCategory: matId === 'pcb' ? pcbGrade : existing?.subCategory,
        qty: existing?.qty || (unit === 'piece' ? 1 : 5),
        qtyRange: existing?.qtyRange,
        unit,
        condition: existing?.condition || 'whole',
      };
    });

    updateDraft({ items: currentItems });
    saveDraft();

    // Check if hazardous items are selected (battery or CRT)
    const hasHazard = selectedMaterials.includes('battery') || selectedMaterials.includes('crt');
    if (hasHazard) {
      const hazardType = selectedMaterials.includes('battery') ? 'battery' : 'crt';
      router.push({
        pathname: '/safety/alert',
        params: { hazard: hazardType, returnTo: '/sell/weight' },
      });
    } else {
      router.push('/sell/weight');
    }
  };

  return (
    <ScreenShell>
      <TopBar title={t('sell')} onBack={() => router.back()} />

      <View style={styles.stepContainer}>
        <StepIndicator currentStep={2} totalSteps={5} lang={lang} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text variant="heading" style={styles.title}>
              {t('whatIsIt')}
            </Text>
            <Text variant="body" color={tokens.inkMuted}>
              {t('tapWhatYouSee')}
            </Text>
          </View>
          <ListenButton textToSpeak={`${t('whatIsIt')}. ${t('tapWhatYouSee')}`} lang={lang} />
        </View>

        {/* AI/ML Classifier Suggestion (shown only when confidence >= 0.7) */}
        {classifierSuggestion && (
          <View style={styles.suggestionCard}>
            <Text variant="label" color={tokens.primary}>
              Suggested: {t(MATERIAL_OPTIONS.find((o) => o.id === classifierSuggestion.materialId)?.labelKey || 'matOther')}
            </Text>
          </View>
        )}

        {/* 3x3 Material Grid */}
        <View style={styles.grid}>
          {MATERIAL_OPTIONS.map((opt) => {
            const isSelected = selectedMaterials.includes(opt.id);
            const PictogramComponent = opt.Component;
            const label = t(opt.labelKey);

            return (
              <View key={opt.id} style={styles.tileWrapper}>
                <TouchableOpacity
                  style={[styles.tile, isSelected && styles.tileSelected]}
                  onPress={() => toggleMaterial(opt.id)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isSelected }}
                  accessibilityLabel={label}
                >
                  {isSelected && (
                    <View style={styles.checkBadge}>
                      <Check size={14} color={tokens.surface} weight="bold" />
                    </View>
                  )}
                  <PictogramComponent size={56} />
                  <Text variant="label" style={styles.tileLabel} numberOfLines={2}>
                    {label}
                  </Text>
                </TouchableOpacity>
                <View style={styles.listenBtnWrapper}>
                  <ListenButton textToSpeak={label} lang={lang} size={28} />
                </View>
              </View>
            );
          })}
        </View>

        {/* PCB Grade Sub-categories */}
        {selectedMaterials.includes('pcb') && (
          <View style={styles.subCatBox}>
            <Text variant="label" style={styles.subCatTitle}>
              Circuit board grade:
            </Text>
            <View style={styles.chipRow}>
              <Chip
                label={t('pcbHighGrade')}
                selected={pcbGrade === 'high_grade'}
                onPress={() => setPcbGrade('high_grade')}
              />
              <Chip
                label={t('pcbMidGrade')}
                selected={pcbGrade === 'mid_grade'}
                onPress={() => setPcbGrade('mid_grade')}
              />
              <Chip
                label={t('pcbLowGrade')}
                selected={pcbGrade === 'low_grade'}
                onPress={() => setPcbGrade('low_grade')}
              />
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={t('next')}
          variant="primary"
          onPress={handleNext}
          disabled={selectedMaterials.length === 0}
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
  suggestionCard: {
    backgroundColor: tokens.primaryContainer,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: tokens.primary,
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  tileWrapper: {
    width: '31%',
    marginBottom: 8,
    position: 'relative',
  },
  tile: {
    backgroundColor: tokens.surface,
    borderWidth: 1,
    borderColor: tokens.outline,
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 110,
    position: 'relative',
  },
  tileSelected: {
    backgroundColor: tokens.primaryContainer,
    borderColor: tokens.primary,
    borderWidth: 2,
  },
  checkBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: tokens.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileLabel: {
    marginTop: 6,
    textAlign: 'center',
    fontSize: 13,
  },
  listenBtnWrapper: {
    alignItems: 'center',
    marginTop: 2,
  },
  subCatBox: {
    marginTop: 20,
    padding: 16,
    backgroundColor: tokens.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: tokens.outline,
  },
  subCatTitle: {
    marginBottom: 10,
  },
  chipRow: {
    flexDirection: 'column',
    gap: 8,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: tokens.paper,
  },
});
