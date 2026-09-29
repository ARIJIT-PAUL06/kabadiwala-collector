// Serves: R01, R11
import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../theme/tokens';
import { PictogramProps } from './Crt';

export const Cable: React.FC<PictogramProps> = ({
  size = 56,
  accessibilityLabel = 'Wire / Cable bundle',
}) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      accessibilityLabel={accessibilityLabel}
    >
      {/* Mis-registered print fill */}
      <Path
        d="M 17.5 19.5 Q 33.5 13 47.5 21.5 Q 51.5 37 43.5 49.5 Q 23.5 53 15.5 41.5 Z"
        fill={colors.moneyContainer}
      />
      {/* Outer loop coil with hand wobble */}
      <Path
        d="M 16 22 Q 32 14 46 22 Q 52 36 44 48 Q 24 54 14 42 Q 10 30 20 20 Q 34 14 48 26"
        fill="none"
        stroke={colors.ink}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Inner loop coil */}
      <Path
        d="M 22 26 Q 34 20 42 28 Q 46 38 38 44 Q 26 48 20 40 Q 16 32 26 24"
        fill="none"
        stroke={colors.ink}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Cable lead out to plug */}
      <Path
        d="M 44 48 L 52 50 L 52 44"
        fill="none"
        stroke={colors.ink}
        strokeWidth={2.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Plug head */}
      <Path
        d="M 50 42 L 56 43 L 55 51 L 49 50 Z"
        fill={colors.ink}
      />
      {/* Prongs */}
      <Path
        d="M 56 45 L 60 45 M 55 49 L 59 49"
        stroke={colors.ink}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
};
