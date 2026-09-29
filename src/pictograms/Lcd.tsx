// Serves: R01, R11
import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../theme/tokens';
import { PictogramProps } from './Crt';

export const Lcd: React.FC<PictogramProps> = ({
  size = 56,
  accessibilityLabel = 'Flat screen / LCD monitor',
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
        d="M 9.5 13.5 Q 31.5 12 53.5 13.5 L 53.5 43.5 L 9.5 43.5 Z"
        fill={colors.primaryContainer}
      />
      {/* Thin flat screen frame with slight wobble */}
      <Path
        d="M 8 12 Q 31 10.8 54 12 Q 54.8 26 54 42 Q 30 43.2 8 42 Q 7.2 27 8 12 Z"
        fill="none"
        stroke={colors.ink}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Screen inner active display */}
      <Path
        d="M 12 16 L 50 16 L 50 38 L 12 38 Z"
        fill="none"
        stroke={colors.ink}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Stand stem */}
      <Path
        d="M 31 42 L 31 52 M 28 42 L 28 52"
        stroke={colors.ink}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      {/* Flat stand base */}
      <Path
        d="M 18 52 Q 31 51 44 52"
        stroke={colors.ink}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
    </Svg>
  );
};
