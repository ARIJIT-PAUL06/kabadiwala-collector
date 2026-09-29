// Serves: R11, R13
import { Text as RNText, TextProps as RNTextProps, TextStyle } from 'react-native';
import { colors } from '../theme/tokens';
import { typeScale, TypographyVariant, getFontFamily } from '../theme/typography';

export interface AppTextProps extends RNTextProps {
  variant?: TypographyVariant;
  color?: keyof typeof colors | string;
  lang?: 'en' | 'hi' | 'mr';
  weight?: '400' | '500' | '700';
  isMoney?: boolean;
}

export const Text: React.FC<AppTextProps> = ({
  children,
  style,
  variant = 'body',
  color = colors.ink,
  lang = 'en',
  weight,
  isMoney = false,
  maxFontSizeMultiplier = 1.3,
  ...rest
}) => {
  const scale = typeScale[variant];
  const chosenWeight = weight || scale.fontWeight;
  const isDevanagari = (lang === 'hi' || lang === 'mr') && !isMoney;
  const fontFamily = isMoney
    ? 'NotoSans_700Bold'
    : getFontFamily(lang, chosenWeight);
  const resolvedColor = (colors as Record<string, string>)[color] || color;
  const lineHeight = isDevanagari ? scale.lineHeightDevanagari : scale.lineHeightEn;

  const combinedStyle: TextStyle = {
    fontFamily,
    fontSize: scale.fontSize,
    lineHeight,
    color: resolvedColor,
    includeFontPadding: false,
  };

  return (
    <RNText
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      style={[combinedStyle, style]}
      {...rest}
    >
      {children}
    </RNText>
  );
};
