// Serves: R01, R11
import React from 'react';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { colors } from '../theme/tokens';
import { PictogramProps } from './Crt';

export const Pcb: React.FC<PictogramProps> = ({
  size = 56,
  accessibilityLabel = 'Circuit board / PCB',
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
        d="M 11.5 11.5 Q 31.5 10 51.5 11.5 L 51.5 51.5 L 11.5 51.5 Z"
        fill={colors.moneyContainer}
      />
      {/* Circuit board outline with notched corner */}
      <Path
        d="M 10 10 Q 30 9 46 10 L 52 16 Q 53 32 52 52 Q 31 53 10 52 Q 9 31 10 10 Z"
        fill="none"
        stroke={colors.ink}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Microchip 1 */}
      <Rect
        x={18}
        y={18}
        width={14}
        height={14}
        rx={2}
        fill={colors.surface}
        stroke={colors.ink}
        strokeWidth={2}
      />
      {/* Chip pins */}
      <Path
        d="M 15 21 L 18 21 M 15 25 L 18 25 M 15 29 L 18 29 M 32 21 L 35 21 M 32 25 L 35 25 M 32 29 L 35 29"
        stroke={colors.ink}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      {/* Traces */}
      <Path
        d="M 25 32 L 25 44 L 38 44 M 32 25 L 44 25 L 44 36"
        fill="none"
        stroke={colors.ink}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Via dots */}
      <Circle cx={38} cy={44} r={2.5} fill={colors.ink} />
      <Circle cx={44} cy={36} r={2.5} fill={colors.ink} />
      <Circle cx={20} cy={42} r={2} fill={colors.ink} />
    </Svg>
  );
};
