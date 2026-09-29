// Serves: R10, R11
import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors } from '../../theme/tokens';
import { PictogramProps } from '../Crt';

export const BatteryCare: React.FC<PictogramProps> = ({
  size = 64,
  accessibilityLabel = 'Keep batteries dry and do not puncture',
}) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      accessibilityLabel={accessibilityLabel}
    >
      {/* Background hazard tint */}
      <Circle cx={32} cy={32} r={28} fill={colors.dangerContainer} />

      {/* Swollen, bloated battery */}
      <Path
        d="M 20 22 Q 14 34 20 46 L 40 46 Q 46 34 40 22 Z"
        fill="#F5C4BA"
        stroke={colors.ink}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Battery contacts */}
      <Path
        d="M 26 22 L 26 18 M 34 22 L 34 18"
        stroke={colors.ink}
        strokeWidth={2.5}
        strokeLinecap="round"
      />

      {/* Flame spark / water drop near battery */}
      <Path
        d="M 46 26 Q 44 20 49 16 Q 54 22 50 28 Z"
        fill="#E86C38"
        stroke={colors.ink}
        strokeWidth={1.8}
      />
      <Path
        d="M 45 40 Q 42 45 47 48 Q 50 45 47 40 Z"
        fill="#4A90E2"
        stroke={colors.ink}
        strokeWidth={1.8}
      />

      {/* Danger Circle & Slash */}
      <Circle
        cx={32}
        cy={32}
        r={27}
        fill="none"
        stroke={colors.danger}
        strokeWidth={3.5}
      />
      <Path
        d="M 13 13 L 51 51"
        stroke={colors.danger}
        strokeWidth={3.5}
        strokeLinecap="round"
      />
    </Svg>
  );
};
