// Serves: R01, R11
import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../theme/tokens';
import { PictogramProps } from './Crt';

export const Plastic: React.FC<PictogramProps> = ({
  size = 56,
  accessibilityLabel = 'Mixed plastic scrap / Broken casing',
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
        d="M 13.5 17.5 L 39.5 13.5 L 49.5 35.5 L 21.5 51.5 Z"
        fill={colors.primaryContainer}
      />
      {/* Large jagged broken housing fragment */}
      <Path
        d="M 12 16 L 38 12 L 48 24 L 42 38 L 32 34 L 28 48 L 14 42 L 20 30 Z"
        fill="none"
        stroke={colors.ink}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Screw hole boss & rib on casing fragment */}
      <Path
        d="M 24 22 L 32 20 M 28 26 L 30 32"
        stroke={colors.ink}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      {/* Smaller broken shard alongside */}
      <Path
        d="M 44 40 L 54 36 L 52 48 L 40 48 Z"
        fill="none"
        stroke={colors.ink}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Tiny scrap chip */}
      <Path
        d="M 48 16 L 53 14 L 51 20 Z"
        fill={colors.ink}
      />
    </Svg>
  );
};
