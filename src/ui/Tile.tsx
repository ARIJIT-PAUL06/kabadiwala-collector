// Serves: R01, R06, R10, R11, R13
import React from 'react';
import { View, Pressable, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Check } from 'phosphor-react-native';
import { colors, radius, spacing } from '../theme/tokens';
import { Text } from './Text';
import { ListenButton } from './ListenButton';

export interface TileProps {
  label: string;
  subLabel?: string;
  icon: React.ReactNode;
  onPress: () => void;
  selected?: boolean;
  isPrimary?: boolean;
  voiceText?: string;
  lang?: 'en' | 'hi' | 'mr';
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const Tile: React.FC<TileProps> = ({
  label,
  subLabel,
  icon,
  onPress,
  selected = false,
  isPrimary = false,
  voiceText,
  lang = 'en',
  style,
  testID,
}) => {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={`${label}${selected ? ', selected' : ''}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        isPrimary && styles.primaryTile,
        selected && styles.selectedTile,
        pressed && (isPrimary ? styles.primaryPressed : styles.pressed),
        style,
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.iconContainer}>{icon}</View>
        <View style={styles.actionContainer}>
          {selected && (
            <View style={styles.checkBadge}>
              <Check size={16} color={colors.surface} weight="bold" />
            </View>
          )}
          <ListenButton
            textToSpeak={voiceText || label}
            lang={lang}
            size={18}
            style={styles.listenBtn}
          />
        </View>
      </View>

      <View style={styles.textContainer}>
        <Text
          variant="heading"
          weight="500"
          lang={lang}
          color={isPrimary ? colors.surface : colors.ink}
          style={styles.label}
          numberOfLines={2}
        >
          {label}
        </Text>
        {subLabel ? (
          <Text
            variant="caption"
            lang={lang}
            color={isPrimary ? 'rgba(255,255,255,0.8)' : colors.inkMuted}
            style={styles.subLabel}
            numberOfLines={1}
          >
            {subLabel}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  tile: {
    minHeight: 120,
    minWidth: 100,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.outline,
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  primaryTile: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  selectedTile: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primary,
    borderWidth: 2,
  },
  pressed: {
    backgroundColor: colors.surfaceAlt,
  },
  primaryPressed: {
    backgroundColor: colors.primaryPressed,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  checkBadge: {
    width: 24,
    height: 24,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listenBtn: {
    minWidth: 36,
    minHeight: 36,
    width: 36,
    height: 36,
  },
  textContainer: {
    marginTop: spacing.sm,
  },
  label: {
    lineHeight: 24,
  },
  subLabel: {
    marginTop: 2,
  },
});
