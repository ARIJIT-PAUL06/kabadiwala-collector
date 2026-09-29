// Serves: R10, R11
import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors } from '../../theme/tokens';
import { PictogramProps } from '../Crt';

export const NoAcid: React.FC<PictogramProps> = ({
  size = 64,
  accessibilityLabel = 'Do not use acid on circuit boards',
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

      {/* Acid bottle tilted */}
      <Path
        d="M 22 14 L 30 18 L 26 26 L 36 34 L 28 42 L 18 34 L 24 24 Z"
        fill="#A6B3C0"
        stroke={colors.ink}
        strokeWidth={2.2}
        strokeLinejoin="round"
      />

      {/* Acid drops dripping onto PCB */}
      <Path
        d="M 38 36 Q 37 40 40 41 Q 42 39 39 36 Z M 44 41 Q 43 45 46 46 Q 48 44 45 41 Z"
        fill="#D66011"
        stroke={colors.ink}
        strokeWidth={1.5}
      />

      {/* Board at bottom dissolving */}
      <Path
        d="M 28 48 L 50 48 L 48 54 L 26 54 Z"
        fill="none"
        stroke={colors.ink}
        strokeWidth={2.2}
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
