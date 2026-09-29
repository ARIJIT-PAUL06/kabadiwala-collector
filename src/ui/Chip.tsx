// Serves: R01, R11, R15
import React from 'react';
import { Pressable, StyleSheet, StyleProp, ViewStyle, View } from 'react-native';
import { colors, radius, spacing } from '../theme/tokens';
import { Text } from './Text';

export interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  leadingIcon?: React.ReactNode;
  lang?: 'en' | 'hi' | 'mr';
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  onPress,
  leadingIcon,
  lang = 'en',
  style,
  testID,
}) => {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.selectedChip,
        pressed && styles.pressed,
        style,
      ]}
    >
      {leadingIcon ? <View style={styles.icon}>{leadingIcon}</View> : null}
      <Text
        variant="label"
        weight="500"
        lang={lang}
        color={selected ? colors.onPrimaryContainer : colors.ink}
        style={styles.text}
      >
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  chip: {
    minHeight: 44,
    height: 44,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outline,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  selectedChip: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  pressed: {
    backgroundColor: colors.surfaceAlt,
  },
  icon: {
    marginRight: spacing.xs,
  },
  text: {
    fontSize: 15,
  },
});
