// Serves: R11, R13
// Theme tokens specified in Master Prompt Section 6.2
export const colors = {
  paper: '#F7F6F2',
  surface: '#FFFFFF',
  surfaceAlt: '#F4F6F5',
  outline: '#D5DCD8',
  ink: '#1A2330',
  inkMuted: '#56616B',
  primary: '#1E6B45',
  primaryPressed: '#17553A',
  primaryContainer: '#E4F0E9',
  onPrimaryContainer: '#12462D',
  money: '#9E520A',
  moneyContainer: '#FBEEDD',
  success: '#1E7B34',
  warning: '#8A5C00',
  warningContainer: '#FFF4DC',
  danger: '#B42318',
  dangerContainer: '#FDECEA',
  info: '#1F4E79',
  infoContainer: '#E8F0F8',
} as const;

export type ColorToken = keyof typeof colors;
export const tokens = colors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 20,
  full: 9999,
} as const;
