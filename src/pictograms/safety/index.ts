// Serves: R10, R11
import React from 'react';
import { NoBurn } from './NoBurn';
import { NoBreakCrt } from './NoBreakCrt';
import { BatteryCare } from './BatteryCare';
import { NoAcid } from './NoAcid';
import { NoDesolder } from './NoDesolder';
import { GlovesMask } from './GlovesMask';

export { NoBurn, NoBreakCrt, BatteryCare, NoAcid, NoDesolder, GlovesMask };

export type SafetyPictogramId =
  | 'no_burn'
  | 'no_break_crt'
  | 'battery_care'
  | 'no_acid'
  | 'no_desolder'
  | 'gloves_mask';

export const SafetyPictograms: Record<
  SafetyPictogramId,
  React.FC<{ size?: number; accessibilityLabel?: string }>
> = {
  no_burn: NoBurn,
  no_break_crt: NoBreakCrt,
  battery_care: BatteryCare,
  no_acid: NoAcid,
  no_desolder: NoDesolder,
  gloves_mask: GlovesMask,
};

export const getSafetyPictogram = (
  id: SafetyPictogramId,
  size = 64,
  label?: string,
): React.ReactNode => {
  const Comp = SafetyPictograms[id] || GlovesMask;
  return React.createElement(Comp, { size, accessibilityLabel: label });
};
