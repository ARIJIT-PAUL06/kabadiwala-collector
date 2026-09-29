// Serves: R12, R13
import React from 'react';
import { View, Pressable, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { CloudCheck, CloudSlash, ArrowsClockwise } from 'phosphor-react-native';
import { colors, radius, spacing } from '../theme/tokens';
import { Text } from './Text';

export type SyncState = 'synced' | 'pending' | 'offline';

export interface SyncDotProps {
  state?: SyncState;
  pendingCount?: number;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const SyncDot: React.FC<SyncDotProps> = ({
  state = 'synced',
  pendingCount = 0,
  onPress,
  style,
}) => {
  const isSynced = state === 'synced';
  const isPending = state === 'pending';
  const isOffline = state === 'offline';

  const dotColor = isSynced
    ? colors.success
    : isPending
    ? colors.warning
    : colors.inkMuted;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Sync status: ${state}${isPending ? `, ${pendingCount} pending` : ''}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
        style,
      ]}
      hitSlop={8}
    >
      {isOffline ? (
        <CloudSlash size={20} color={colors.inkMuted} weight="bold" />
      ) : isPending ? (
        <View style={styles.pendingRow}>
          <ArrowsClockwise size={16} color={colors.warning} weight="bold" />
          {pendingCount > 0 ? (
            <Text variant="caption" weight="700" color={colors.warning} style={styles.badgeText}>
              {pendingCount}
            </Text>
          ) : null}
        </View>
      ) : (
        <CloudCheck size={20} color={colors.success} weight="bold" />
      )}
      <View style={[styles.dot, { backgroundColor: dotColor }]} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 44,
    minWidth: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: spacing.xs,
  },
  pressed: {
    opacity: 0.7,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
  },
  pendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  badgeText: {
    fontSize: 12,
    lineHeight: 14,
  },
});
