// Serves: R01, R11
import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../theme/tokens';
import { PictogramProps } from './Crt';

export const Magnet: React.FC<PictogramProps> = ({
  size = 56,
  accessibilityLabel = 'Magnet assembly / Speaker scrap',
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
        d="M 13.5 17.5 Q 31.5 12 49.5 17.5 L 49.5 49.5 L 13.5 49.5 Z"
        fill={colors.primaryContainer}
      />
      {/* Horseshoe U-magnet profile with hand curve */}
      <Path
        d="M 14 16 L 24 16 L 24 34 Q 24 42 32 42 Q 40 42 40 34 L 40 16 L 50 16 L 50 35 Q 50 51 32 51 Q 14 51 14 35 Z"
        fill="none"
        stroke={colors.ink}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* North & South pole division lines */}
      <Path
        d="M 14 24 L 24 24 M 40 24 L 50 24"
        stroke={colors.ink}
        strokeWidth={2}
        strokeLinecap="round"
      />
      {/* Magnetic field line ripples */}
      <Path
        d="M 28 14 Q 32 10 36 14 M 26 10 Q 32 5 38 10"
        fill="none"
        stroke={colors.ink}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
};
