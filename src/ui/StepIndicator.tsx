// Serves: R01, R11
import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { colors, radius, spacing } from '../theme/tokens';
import { Text } from './Text';

export interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabel?: string;
  lang?: 'en' | 'hi' | 'mr';
  style?: StyleProp<ViewStyle>;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  totalSteps,
  stepLabel,
  lang = 'en',
  style,
}) => {
  const getStepText = () => {
    if (stepLabel) return stepLabel;
    if (lang === 'mr') return `टप्पा ${currentStep} / ${totalSteps}`;
    if (lang === 'hi') return `चरण ${currentStep} / ${totalSteps}`;
    return `Step ${currentStep} of ${totalSteps}`;
  };

  return (
    <View style={[styles.container, style]}>
      <Text variant="label" weight="700" lang={lang} color={colors.inkMuted} style={styles.text}>
        {getStepText()}
      </Text>
      <View style={styles.segmentsRow}>
        {Array.from({ length: totalSteps }).map((_, idx) => {
          const isCompleted = idx + 1 <= currentStep;
          return (
            <View
              key={idx}
              style={[
                styles.segment,
                isCompleted ? styles.activeSegment : styles.inactiveSegment,
              ]}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  text: {
    fontSize: 14,
    textTransform: 'uppercase',
  },
  segmentsRow: {
    flexDirection: 'row',
    gap: 6,
    width: '100%',
  },
  segment: {
    flex: 1,
    height: 4,
    borderRadius: radius.full,
  },
  activeSegment: {
    backgroundColor: colors.primary,
  },
  inactiveSegment: {
    backgroundColor: colors.outline,
  },
});
