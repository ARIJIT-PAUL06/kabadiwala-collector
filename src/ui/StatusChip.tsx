// Serves: R03, R08, R09
import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { colors, radius, spacing } from '../theme/tokens';
import { Text } from './Text';

export type LotStatusType =
  | 'DRAFT'
  | 'VALUED'
  | 'OFFERED'
  | 'ACCEPTED'
  | 'HANDED_OVER'
  | 'CONFIRMED'
  | 'PAID'
  | 'PAYMENT_PENDING'
  | 'CANCELLED';

export interface StatusChipProps {
  status: LotStatusType;
  label?: string;
  lang?: 'en' | 'hi' | 'mr';
  style?: StyleProp<ViewStyle>;
}

const statusConfig: Record<
  LotStatusType,
  { bg: string; text: string; border: string; defaultLabel: string }
> = {
  DRAFT: {
    bg: colors.surfaceAlt,
    text: colors.inkMuted,
    border: colors.outline,
    defaultLabel: 'Draft',
  },
  VALUED: {
    bg: colors.infoContainer,
    text: colors.info,
    border: '#BCD2E8',
    defaultLabel: 'Valued',
  },
  OFFERED: {
    bg: colors.warningContainer,
    text: colors.warning,
    border: '#EEDAA8',
    defaultLabel: 'Offered',
  },
  ACCEPTED: {
    bg: colors.primaryContainer,
    text: colors.primary,
    border: '#BDE3CE',
    defaultLabel: 'Accepted',
  },
  HANDED_OVER: {
    bg: colors.infoContainer,
    text: colors.info,
    border: '#BCD2E8',
    defaultLabel: 'Handed Over',
  },
  CONFIRMED: {
    bg: '#E3F6E8',
    text: colors.success,
    border: '#A7E1B8',
    defaultLabel: 'Verified',
  },
  PAID: {
    bg: '#E3F6E8',
    text: colors.success,
    border: '#A7E1B8',
    defaultLabel: 'Paid',
  },
  PAYMENT_PENDING: {
    bg: colors.warningContainer,
    text: colors.warning,
    border: '#EEDAA8',
    defaultLabel: 'Payment Pending',
  },
  CANCELLED: {
    bg: colors.dangerContainer,
    text: colors.danger,
    border: '#F7C6C2',
    defaultLabel: 'Cancelled',
  },
};

export const StatusChip: React.FC<StatusChipProps> = ({
  status,
  label,
  lang = 'en',
  style,
}) => {
  const cfg = statusConfig[status] || statusConfig.DRAFT;
  const displayLabel = label || cfg.defaultLabel;

  return (
    <View
      style={[
        styles.chip,
        { backgroundColor: cfg.bg, borderColor: cfg.border },
        style,
      ]}
    >
      <Text
        variant="caption"
        weight="500"
        lang={lang}
        color={cfg.text}
        style={styles.text}
      >
        {displayLabel}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 13,
    lineHeight: 16,
    textTransform: 'uppercase',
  },
});
