// Serves: R01, R10, R11
import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../theme/tokens';
import { PictogramProps } from './Crt';

export const Battery: React.FC<PictogramProps> = ({
  size = 56,
  accessibilityLabel = 'Battery',
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
        d="M 11.5 17.5 L 31.5 17.5 L 31.5 49.5 L 11.5 49.5 Z M 37.5 21.5 L 53.5 21.5 L 53.5 53.5 L 37.5 53.5 Z"
        fill={colors.dangerContainer}
      />
      {/* Flat rectangular phone battery */}
      <Path
        d="M 10 16 Q 20 15 30 16 Q 31 32 30 48 Q 20 49 10 48 Q 9 32 10 16 Z"
        fill="none"
        stroke={colors.ink}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Gold/copper battery contact terminals */}
      <Path
        d="M 13 16 L 13 13 L 17 13 L 17 16 M 23 16 L 23 13 L 27 13 L 27 16"
        stroke={colors.ink}
        strokeWidth={2}
        strokeLinecap="round"
      />
      {/* Battery label line & charge mark */}
      <Path
        d="M 14 26 L 26 26 M 20 32 L 20 40 M 16 36 L 24 36"
        stroke={colors.ink}
        strokeWidth={2}
        strokeLinecap="round"
      />

      {/* Cylindrical cell alongside */}
      <Path
        d="M 36 22 Q 44 20 52 22 Q 53 36 52 52 Q 44 54 36 52 Q 35 36 36 22 Z"
        fill="none"
        stroke={colors.ink}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Positive nub on cylinder */}
      <Path
        d="M 41 21 L 41 18 L 47 18 L 47 21"
        fill="none"
        stroke={colors.ink}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Band markings on cylinder */}
      <Path
        d="M 36 28 Q 44 27 52 28 M 36 46 Q 44 45 52 46"
        stroke={colors.ink}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
};
