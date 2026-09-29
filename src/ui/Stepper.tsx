// Serves: R01, R11, R13
import React from 'react';
import { View, Pressable, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Plus, Minus } from 'phosphor-react-native';
import { colors, radius, spacing } from '../theme/tokens';
import { Text } from './Text';

export interface StepperProps {
  value: number;
  onChange: (val: number) => void;
  step?: number;
  largeStep?: number;
  min?: number;
  max?: number;
  unit?: string;
  style?: StyleProp<ViewStyle>;
}

export const Stepper: React.FC<StepperProps> = ({
  value,
  onChange,
  step = 1,
  largeStep,
  min = 0,
  max = 9999,
  unit,
  style,
}) => {
  const handleDecrement = (amount: number) => {
    const next = Math.max(min, Number((value - amount).toFixed(1)));
    onChange(next);
  };

  const handleIncrement = (amount: number) => {
    const next = Math.min(max, Number((value + amount).toFixed(1)));
    onChange(next);
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.controlsRow}>
        {largeStep ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Minus ${largeStep}`}
            disabled={value <= min}
            onPress={() => handleDecrement(largeStep)}
            style={({ pressed }) => [
              styles.stepBtn,
              styles.secondaryStepBtn,
              pressed && styles.pressed,
              value <= min && styles.disabled,
            ]}
          >
            <Text variant="label" weight="700" color={colors.primary}>
              -{largeStep}
            </Text>
          </Pressable>
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Minus ${step}`}
          disabled={value <= min}
          onPress={() => handleDecrement(step)}
          style={({ pressed }) => [
            styles.stepBtn,
            pressed && styles.pressed,
            value <= min && styles.disabled,
          ]}
        >
          <Minus size={24} color={value <= min ? colors.inkMuted : colors.ink} weight="bold" />
        </Pressable>

        <View style={styles.valueContainer}>
          <Text variant="display" weight="700" color={colors.ink} style={styles.valueText}>
            {value}
          </Text>
          {unit ? (
            <Text variant="heading" color={colors.inkMuted} style={styles.unitText}>
              {unit}
            </Text>
          ) : null}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Plus ${step}`}
          disabled={value >= max}
          onPress={() => handleIncrement(step)}
          style={({ pressed }) => [
            styles.stepBtn,
            pressed && styles.pressed,
            value >= max && styles.disabled,
          ]}
        >
          <Plus size={24} color={value >= max ? colors.inkMuted : colors.ink} weight="bold" />
        </Pressable>

        {largeStep ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Plus ${largeStep}`}
            disabled={value >= max}
            onPress={() => handleIncrement(largeStep)}
            style={({ pressed }) => [
              styles.stepBtn,
              styles.secondaryStepBtn,
              pressed && styles.pressed,
              value >= max && styles.disabled,
            ]}
          >
            <Text variant="label" weight="700" color={colors.primary}>
              +{largeStep}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.outline,
    padding: spacing.md,
    alignItems: 'center',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    width: '100%',
  },
  stepBtn: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.outline,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryStepBtn: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primary,
  },
  pressed: {
    backgroundColor: colors.outline,
  },
  disabled: {
    opacity: 0.4,
  },
  valueContainer: {
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  valueText: {
    textAlign: 'center',
  },
  unitText: {
    marginTop: -4,
  },
});
