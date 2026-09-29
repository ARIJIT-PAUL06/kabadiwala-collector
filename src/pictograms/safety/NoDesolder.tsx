// Serves: R10, R11
import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors } from '../../theme/tokens';
import { PictogramProps } from '../Crt';

export const NoDesolder: React.FC<PictogramProps> = ({
  size = 64,
  accessibilityLabel = 'Do not melt solder or dismantle at home',
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

      {/* Soldering iron tip pointing down-right */}
      <Path
        d="M 16 18 L 30 32 L 28 36 L 14 22 Z"
        fill="#A6B3C0"
        stroke={colors.ink}
        strokeWidth={2.2}
        strokeLinejoin="round"
      />
      {/* Metal heating element & hot tip */}
      <Path
        d="M 30 32 L 40 42 L 36 44 L 28 36 Z"
        fill="#D66011"
        stroke={colors.ink}
        strokeWidth={2}
      />
      <Path
        d="M 40 42 L 44 46"
        stroke={colors.ink}
        strokeWidth={3}
        strokeLinecap="round"
      />

      {/* Noxious toxic fumes rising */}
      <Path
        d="M 44 40 Q 40 32 46 26 Q 52 20 48 14"
        fill="none"
        stroke={colors.ink}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Path
        d="M 48 38 Q 44 32 50 28"
        fill="none"
        stroke={colors.ink}
        strokeWidth={1.8}
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
