// Serves: R10, R11
import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors } from '../../theme/tokens';
import { PictogramProps } from '../Crt';

export const NoBurn: React.FC<PictogramProps> = ({
  size = 64,
  accessibilityLabel = 'Never burn wires or cables',
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

      {/* Wire loop */}
      <Path
        d="M 16 46 Q 32 44 48 46 M 20 42 Q 32 40 44 42"
        stroke={colors.ink}
        strokeWidth={2.5}
        strokeLinecap="round"
      />

      {/* Flame tongues */}
      <Path
        d="M 28 42 Q 24 32 30 26 Q 34 32 36 22 Q 42 32 38 42 Z"
        fill="#E86C38"
        stroke={colors.ink}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />

      {/* Toxic black smoke plume */}
      <Path
        d="M 33 20 Q 28 14 34 10 Q 40 12 38 16"
        fill="none"
        stroke={colors.ink}
        strokeWidth={2}
        strokeLinecap="round"
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
