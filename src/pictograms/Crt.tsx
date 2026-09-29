// Serves: R01, R11
import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../theme/tokens';

export interface PictogramProps {
  size?: number;
  accessibilityLabel?: string;
}

export const Crt: React.FC<PictogramProps> = ({
  size = 56,
  accessibilityLabel = 'Old TV / CRT Monitor',
}) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      accessibilityLabel={accessibilityLabel}
    >
      {/* Mis-registered print accent fill */}
      <Path
        d="M 11.5 15.5 Q 26.5 14 41.5 15.5 L 53.5 24.5 L 51.5 45.5 L 11.5 49.5 Z"
        fill={colors.dangerContainer}
      />
      {/* Hand-drawn boxy CRT body from the side */}
      <Path
        d="M 10 14 Q 25 12.8 40 14 Q 41.2 28 40 48 Q 24 49.2 10 48 Q 8.8 30 10 14 Z"
        fill="none"
        stroke={colors.ink}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* CRT deep back tube */}
      <Path
        d="M 40 17 L 53 25 Q 54 34 52 42 L 40 45"
        fill="none"
        stroke={colors.ink}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Screen inner curvature */}
      <Path
        d="M 14 18 Q 25 17.2 35 18 Q 36 29 35 44 Q 24 44.8 14 44 Q 13 30 14 18 Z"
        fill="none"
        stroke={colors.ink}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Screen glare notch */}
      <Path
        d="M 17 22 L 23 22"
        stroke={colors.ink}
        strokeWidth={2}
        strokeLinecap="round"
      />
      {/* TV base stand */}
      <Path
        d="M 20 48 L 18 53 Q 32 53.5 44 53 L 42 48"
        fill="none"
        stroke={colors.ink}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
