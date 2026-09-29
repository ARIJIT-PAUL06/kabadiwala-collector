// Serves: R01, R11, R13
import React from 'react';
import {
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  StyleProp,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, radius, spacing } from '../theme/tokens';
import { Text } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'text';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  testID?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  accessibilityLabel,
  testID,
}) => {
  const handlePress = () => {
    if (disabled || loading) return;
    if (Platform.OS !== 'web') {
      try {
        Haptics.selectionAsync().catch(() => {});
      } catch {
        // no-op
      }
    }
    onPress();
  };

  const isOutline = variant === 'outline';
  const isSecondary = variant === 'secondary';
  const isDanger = variant === 'danger';
  const isText = variant === 'text';

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled: disabled || loading }}
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'primary' && pressed && styles.primaryPressed,
        isSecondary && styles.secondary,
        isSecondary && pressed && styles.secondaryPressed,
        isOutline && styles.outline,
        isOutline && pressed && styles.outlinePressed,
        isDanger && styles.danger,
        isDanger && pressed && styles.dangerPressed,
        isText && styles.text,
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={isOutline || isText || isSecondary ? colors.primary : colors.surface}
          size="small"
        />
      ) : (
        <Text
          variant="label"
          weight="500"
          style={[
            styles.label,
            variant === 'primary' && styles.primaryLabel,
            isSecondary && styles.secondaryLabel,
            isOutline && styles.outlineLabel,
            isDanger && styles.dangerLabel,
            isText && styles.textLabel,
            disabled && styles.disabledLabel,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    minHeight: 56,
    height: 56,
    minWidth: 56,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
  },
  primary: {
    backgroundColor: colors.primary,
  },
  primaryPressed: {
    backgroundColor: colors.primaryPressed,
  },
  secondary: {
    backgroundColor: colors.primaryContainer,
  },
  secondaryPressed: {
    backgroundColor: colors.outline,
  },
  outline: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outline,
  },
  outlinePressed: {
    backgroundColor: colors.surfaceAlt,
  },
  danger: {
    backgroundColor: colors.danger,
  },
  dangerPressed: {
    backgroundColor: '#8C1B12',
  },
  text: {
    backgroundColor: 'transparent',
    minHeight: 48,
    height: 48,
  },
  disabled: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.outline,
    opacity: 0.6,
  },
  label: {
    textAlign: 'center',
  },
  primaryLabel: {
    color: colors.surface,
  },
  secondaryLabel: {
    color: colors.onPrimaryContainer,
  },
  outlineLabel: {
    color: colors.ink,
  },
  dangerLabel: {
    color: colors.surface,
  },
  textLabel: {
    color: colors.primary,
  },
  disabledLabel: {
    color: colors.inkMuted,
  },
});
