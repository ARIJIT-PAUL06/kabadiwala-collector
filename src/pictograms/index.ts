// Serves: R01, R11
import React from 'react';
import { Crt } from './Crt';
import { Lcd } from './Lcd';
import { Pcb } from './Pcb';
import { Cable } from './Cable';
import { Battery } from './Battery';
import { Motor } from './Motor';
import { Magnet } from './Magnet';
import { Plastic } from './Plastic';
import { Other } from './Other';

export {
  Crt,
  Lcd,
  Pcb,
  Cable,
  Battery,
  Motor,
  Magnet,
  Plastic,
  Other,
  Crt as CrtPictogram,
  Lcd as LcdPictogram,
  Pcb as PcbPictogram,
  Cable as CablePictogram,
  Battery as BatteryPictogram,
  Motor as MotorPictogram,
  Magnet as MagnetPictogram,
  Plastic as PlasticPictogram,
  Other as OtherPictogram,
};

export type MaterialPictogramId =
  | 'crt'
  | 'lcd'
  | 'pcb'
  | 'cable'
  | 'battery'
  | 'motor'
  | 'magnet'
  | 'plastic'
  | 'other';

export const MaterialPictograms: Record<
  MaterialPictogramId,
  React.FC<{ size?: number; accessibilityLabel?: string }>
> = {
  crt: Crt,
  lcd: Lcd,
  pcb: Pcb,
  cable: Cable,
  battery: Battery,
  motor: Motor,
  magnet: Magnet,
  plastic: Plastic,
  other: Other,
};

export const getMaterialPictogram = (
  id: MaterialPictogramId,
  size = 56,
  label?: string,
): React.ReactNode => {
  const Comp = MaterialPictograms[id] || Other;
  return React.createElement(Comp, { size, accessibilityLabel: label });
};
