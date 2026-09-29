// Serves: R11, R12, R13
import React from 'react';
import { View, Pressable, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { ArrowLeft, Gear, Translate } from 'phosphor-react-native';
import { colors, spacing } from '../theme/tokens';
import { Text } from './Text';
import { SyncDot, SyncState } from './SyncDot';

export interface TopBarProps {
  title?: string;
  onBack?: () => void;
  showBack?: boolean;
  onLanguagePress?: () => void;
  onSettingsPress?: () => void;
  onSyncPress?: () => void;
  syncState?: SyncState;
  pendingSyncCount?: number;
  lang?: 'en' | 'hi' | 'mr';
  style?: StyleProp<ViewStyle>;
}

export const TopBar: React.FC<TopBarProps> = ({
  title = 'Kabadiwala Connect',
  onBack,
  showBack = false,
  onLanguagePress,
  onSettingsPress,
  onSyncPress,
  syncState = 'synced',
  pendingSyncCount = 0,
  lang = 'en',
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.leftSection}>
        {showBack && onBack ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={onBack}
            style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
            hitSlop={8}
          >
            <ArrowLeft size={24} color={colors.ink} weight="bold" />
          </Pressable>
        ) : null}
        <Text
          variant="heading"
          weight="700"
          lang={lang}
          color={colors.ink}
          style={styles.title}
          numberOfLines={1}
        >
          {title}
        </Text>
      </View>

      <View style={styles.rightSection}>
        <SyncDot
          state={syncState}
          pendingCount={pendingSyncCount}
          onPress={onSyncPress}
        />
        {onLanguagePress ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Change language"
            onPress={onLanguagePress}
            style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
            hitSlop={8}
          >
            <Translate size={22} color={colors.ink} weight="bold" />
          </Pressable>
        ) : null}
        {onSettingsPress ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open settings"
            onPress={onSettingsPress}
            style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
            hitSlop={8}
          >
            <Gear size={22} color={colors.ink} weight="bold" />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.paper,
    borderBottomWidth: 1,
    borderBottomColor: colors.outline,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
  },
  title: {
    fontSize: 19,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  iconBtn: {
    minWidth: 40,
    minHeight: 40,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  pressed: {
    backgroundColor: colors.surfaceAlt,
  },
});
