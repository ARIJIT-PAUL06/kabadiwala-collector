// Serves: R05, R10, R12
import React from 'react';
import { View, Pressable, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Warning, Info, CheckCircle, XCircle } from 'phosphor-react-native';
import { colors, radius, spacing } from '../theme/tokens';
import { Text } from './Text';

export type BannerType = 'info' | 'warning' | 'danger' | 'success';

export interface BannerProps {
  message: string;
  type?: BannerType;
  actionText?: string;
  onAction?: () => void;
  lang?: 'en' | 'hi' | 'mr';
  style?: StyleProp<ViewStyle>;
}

export const Banner: React.FC<BannerProps> = ({
  message,
  type = 'info',
  actionText,
  onAction,
  lang = 'en',
  style,
}) => {
  const isWarning = type === 'warning';
  const isDanger = type === 'danger';
  const isSuccess = type === 'success';

  const bgColor = isWarning
    ? colors.warningContainer
    : isDanger
    ? colors.dangerContainer
    : isSuccess
    ? '#E3F6E8'
    : colors.infoContainer;

  const borderColor = isWarning
    ? '#EEDAA8'
    : isDanger
    ? '#F7C6C2'
    : isSuccess
    ? '#A7E1B8'
    : '#BCD2E8';

  const iconColor = isWarning
    ? colors.warning
    : isDanger
    ? colors.danger
    : isSuccess
    ? colors.success
    : colors.info;

  return (
    <View style={[styles.banner, { backgroundColor: bgColor, borderColor }, style]}>
      <View style={styles.iconWrapper}>
        {isWarning ? (
          <Warning size={20} color={iconColor} weight="bold" />
        ) : isDanger ? (
          <XCircle size={20} color={iconColor} weight="bold" />
        ) : isSuccess ? (
          <CheckCircle size={20} color={iconColor} weight="bold" />
        ) : (
          <Info size={20} color={iconColor} weight="bold" />
        )}
      </View>

      <Text
        variant="bodySmall"
        lang={lang}
        color={colors.ink}
        style={styles.message}
      >
        {message}
      </Text>

      {actionText && onAction ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={actionText}
          onPress={onAction}
          style={styles.actionBtn}
          hitSlop={8}
        >
          <Text variant="caption" weight="700" color={iconColor} style={styles.actionText}>
            {actionText}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
    width: '100%',
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  actionBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  actionText: {
    textDecorationLine: 'underline',
  },
});
