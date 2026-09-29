// Serves: R01, R04, R08, R13
import React from 'react';
import { View, Pressable, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { colors, radius, spacing } from '../theme/tokens';

export interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  selected?: boolean;
  variant?: 'surface' | 'surfaceAlt' | 'primaryContainer' | 'moneyContainer' | 'warningContainer';
  accessibilityLabel?: string;
  testID?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  selected = false,
  variant = 'surface',
  accessibilityLabel,
  testID,
}) => {
  const containerStyle = [
    styles.card,
    variant === 'surface' && styles.surface,
    variant === 'surfaceAlt' && styles.surfaceAlt,
    variant === 'primaryContainer' && styles.primaryContainer,
    variant === 'moneyContainer' && styles.moneyContainer,
    variant === 'warningContainer' && styles.warningContainer,
    selected && styles.selected,
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        testID={testID}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={({ pressed }) => [
          containerStyle,
          pressed && styles.pressed,
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View testID={testID} style={containerStyle} accessibilityLabel={accessibilityLabel}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.outline,
    padding: spacing.md,
  },
  surface: {
    backgroundColor: colors.surface,
  },
  surfaceAlt: {
    backgroundColor: colors.surfaceAlt,
  },
  primaryContainer: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primary,
  },
  moneyContainer: {
    backgroundColor: colors.moneyContainer,
    borderColor: '#E6C8A6',
  },
  warningContainer: {
    backgroundColor: colors.warningContainer,
    borderColor: '#EEDAA8',
  },
  selected: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: colors.primaryContainer,
  },
  pressed: {
    opacity: 0.9,
    backgroundColor: colors.surfaceAlt,
  },
});
