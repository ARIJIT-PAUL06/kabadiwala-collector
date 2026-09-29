// Serves: R01, R11
import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../theme/tokens';
import { PictogramProps } from './Crt';

export const Motor: React.FC<PictogramProps> = ({
  size = 56,
  accessibilityLabel = 'Electric motor',
}) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      accessibilityLabel={accessibilityLabel}
    >
      {/* Mis-registered accent fill */}
      <Path
        d="M 19.5 21.5 Q 37.5 19 49.5 21.5 L 49.5 47.5 L 19.5 47.5 Z"
        fill={colors.primaryContainer}
      />
      {/* Motor main cylindrical housing */}
      <Path
        d="M 18 20 Q 34 18.5 48 20 Q 49.2 33 48 46 Q 34 47.5 18 46 Q 16.8 33 18 20 Z"
        fill="none"
        stroke={colors.ink}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Front plate & shaft bearing */}
      <Path
        d="M 48 27 L 54 27 L 54 39 L 48 39"
        fill="none"
        stroke={colors.ink}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Rotating shaft protruding */}
      <Path
        d="M 54 33 L 61 33"
        stroke={colors.ink}
        strokeWidth={3}
        strokeLinecap="round"
      />
      {/* Back end plate */}
      <Path
        d="M 18 25 L 14 25 L 14 41 L 18 41"
        fill="none"
        stroke={colors.ink}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Copper wire leads out the back */}
      <Path
        d="M 14 29 Q 8 28 6 22 M 14 37 Q 9 39 5 44"
        fill="none"
        stroke={colors.ink}
        strokeWidth={2}
        strokeLinecap="round"
      />
      {/* Air vents on motor body */}
      <Path
        d="M 28 26 L 38 26 M 28 33 L 38 33 M 28 40 L 38 40"
        stroke={colors.ink}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
};
