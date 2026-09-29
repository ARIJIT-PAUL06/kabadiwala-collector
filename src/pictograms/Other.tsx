// Serves: R01, R11
import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors } from '../theme/tokens';
import { PictogramProps } from './Crt';

export const Other: React.FC<PictogramProps> = ({
  size = 56,
  accessibilityLabel = 'Other scrap / Unclassified lot',
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
        d="M 15.5 25.5 Q 31.5 21 47.5 25.5 L 51.5 53.5 L 11.5 53.5 Z"
        fill={colors.primaryContainer}
      />
      {/* Tied sack body */}
      <Path
        d="M 14 26 Q 32 23 46 26 Q 52 38 50 54 Q 31 56 12 54 Q 10 38 14 26 Z"
        fill="none"
        stroke={colors.ink}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Tied neck of sack */}
      <Path
        d="M 24 25 Q 31 23 38 25 M 26 23 L 23 15 Q 31 17 39 15 L 36 23"
        fill="none"
        stroke={colors.ink}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Rope knot */}
      <Circle cx={31} cy={24} r={3} fill={colors.ink} />

      {/* Hanging tag with question mark */}
      <Path
        d="M 31 25 L 39 31 L 46 39 L 41 45 L 34 37 Z"
        fill={colors.surface}
        stroke={colors.ink}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Question mark on tag */}
      <Path
        d="M 38 35 Q 40 33 42 35 Q 43 38 40 40 L 40 41"
        fill="none"
        stroke={colors.ink}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Circle cx={40} cy={43} r={1} fill={colors.ink} />
    </Svg>
  );
};
