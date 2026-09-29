// Serves: R10, R11
import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors } from '../../theme/tokens';
import { PictogramProps } from '../Crt';

export const NoBreakCrt: React.FC<PictogramProps> = ({
  size = 64,
  accessibilityLabel = 'Do not smash or break old TV screens',
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

      {/* CRT glass face */}
      <Path
        d="M 18 26 Q 32 24 44 26 Q 45 36 44 48 Q 32 49 18 48 Z"
        fill="none"
        stroke={colors.ink}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Glass shatter crack lines */}
      <Path
        d="M 28 34 L 34 38 L 32 44 M 34 38 L 40 36 M 34 38 L 36 30"
        stroke={colors.ink}
        strokeWidth={1.8}
        strokeLinecap="round"
      />

      {/* Heavy hammer striking downward */}
      <Path
        d="M 22 16 L 36 28 M 32 14 L 40 22 L 36 26 L 28 18 Z"
        fill="#A6B3C0"
        stroke={colors.ink}
        strokeWidth={2.2}
        strokeLinejoin="round"
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
