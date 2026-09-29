// Serves: R01, R02, R09, R11, R13
import React from 'react';
import { TextStyle, StyleProp } from 'react-native';
import { colors } from '../theme/tokens';
import { TypographyVariant } from '../theme/typography';
import { Text } from './Text';

export interface MoneyTextProps {
  amount?: number;
  range?: [number, number];
  unit?: string;
  variant?: TypographyVariant;
  color?: string;
  style?: StyleProp<TextStyle>;
}

export const formatIndianRupees = (n: number): string => {
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Math.round(n));
  } catch {
    return `₹${Math.round(n)}`;
  }
};

export const MoneyText: React.FC<MoneyTextProps> = ({
  amount,
  range,
  unit,
  variant = 'title',
  color = colors.money,
  style,
}) => {
  let formatted = '';
  if (range && range.length === 2) {
    formatted = `${formatIndianRupees(range[0])} – ${formatIndianRupees(range[1])}`;
  } else if (typeof amount === 'number') {
    formatted = formatIndianRupees(amount);
  }

  if (unit) {
    formatted = `${formatted} /${unit}`;
  }

  return (
    <Text
      variant={variant}
      weight="700"
      isMoney={true}
      color={color}
      style={style}
      accessibilityLabel={`Price: ${formatted}`}
    >
      {formatted}
    </Text>
  );
};
