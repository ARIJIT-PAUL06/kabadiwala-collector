// Serves: R10, R11
import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors } from '../../theme/tokens';
import { PictogramProps } from '../Crt';

export const GlovesMask: React.FC<PictogramProps> = ({
  size = 64,
  accessibilityLabel = 'Always wear gloves and mask',
}) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      accessibilityLabel={accessibilityLabel}
    >
      {/* Background success tint */}
      <Circle cx={32} cy={32} r={28} fill="#E3F6E8" />

      {/* Person head outline */}
      <Circle
        cx={32}
        cy={22}
        r={10}
        fill="none"
        stroke={colors.ink}
        strokeWidth={2.2}
      />

      {/* Protective facemask on head */}
      <Path
        d="M 24 22 Q 32 26 40 22 L 38 29 Q 32 33 26 29 Z"
        fill={colors.surface}
        stroke={colors.ink}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      {/* Mask earloop strings */}
      <Path
        d="M 24 23 L 22 21 M 40 23 L 42 21"
        stroke={colors.ink}
        strokeWidth={1.8}
        strokeLinecap="round"
      />

      {/* Pair of protective heavy gloves */}
      <Path
        d="M 18 48 L 18 38 Q 22 36 26 38 L 26 48 Z M 26 40 L 29 42 L 27 46 L 25 44"
        fill={colors.surface}
        stroke={colors.ink}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <Path
        d="M 46 48 L 46 38 Q 42 36 38 38 L 38 48 Z M 38 40 L 35 42 L 37 46 L 39 44"
        fill={colors.surface}
        stroke={colors.ink}
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {/* Big Green Success Checkmark Badge (NOT a slash) */}
      <Circle
        cx={48}
        cy={48}
        r={12}
        fill={colors.success}
      />
      <Path
        d="M 43 48 L 47 52 L 54 44"
        fill="none"
        stroke={colors.surface}
        strokeWidth={2.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
