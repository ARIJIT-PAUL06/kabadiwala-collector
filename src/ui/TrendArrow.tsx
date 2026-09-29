// Serves: R02, R06
import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { TrendUp, TrendDown, Minus } from 'phosphor-react-native';
import { colors } from '../theme/tokens';
import { Text } from './Text';

export type TrendDirection = 'up' | 'down' | 'flat';

export interface TrendArrowProps {
  direction: TrendDirection;
  percentChange?: number;
  size?: number;
  showPercent?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const TrendArrow: React.FC<TrendArrowProps> = ({
  direction,
  percentChange,
  size = 20,
  showPercent = false,
  style,
}) => {
  const isUp = direction === 'up';
  const isDown = direction === 'down';

  const iconColor = isUp ? colors.success : isDown ? colors.danger : colors.inkMuted;

  return (
    <View style={[styles.container, style]}>
      {isUp ? (
        <TrendUp size={size} color={iconColor} weight="bold" />
      ) : isDown ? (
        <TrendDown size={size} color={iconColor} weight="bold" />
      ) : (
        <Minus size={size} color={iconColor} weight="bold" />
      )}
      {showPercent && typeof percentChange === 'number' ? (
        <Text variant="caption" weight="700" color={iconColor} style={styles.percentText}>
          {isUp ? '+' : ''}
          {percentChange}%
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  percentText: {
    fontSize: 13,
  },
});
