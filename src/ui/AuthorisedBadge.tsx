// Serves: R04, R07, R11
import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { SealCheck } from 'phosphor-react-native';
import { colors, radius, spacing } from '../theme/tokens';
import { Text } from './Text';

export interface AuthorisedBadgeProps {
  validUntil?: string;
  authNumber?: string;
  lang?: 'en' | 'hi' | 'mr';
  style?: StyleProp<ViewStyle>;
}

export const AuthorisedBadge: React.FC<AuthorisedBadgeProps> = ({
  validUntil,
  authNumber,
  lang = 'en',
  style,
}) => {
  const getAuthText = () => {
    if (lang === 'mr') return 'अधिकृत';
    if (lang === 'hi') return 'अधिकृत';
    return 'Authorised';
  };

  const getValidText = () => {
    if (!validUntil) return '';
    if (lang === 'mr') return `· ${validUntil} पर्यंत वैध`;
    if (lang === 'hi') return `· ${validUntil} तक मान्य`;
    return `· Valid until ${validUntil}`;
  };

  return (
    <View style={[styles.badge, style]}>
      <SealCheck size={18} color={colors.success} weight="fill" />
      <Text variant="caption" weight="700" color={colors.success} style={styles.text}>
        {getAuthText()} {getValidText()}
      </Text>
      {authNumber ? (
        <Text variant="caption" color={colors.inkMuted} style={styles.subText}>
          ({authNumber})
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F6E8',
    borderColor: '#A7E1B8',
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
    gap: 4,
    flexWrap: 'wrap',
  },
  text: {
    fontSize: 12,
    lineHeight: 16,
  },
  subText: {
    fontSize: 11,
    lineHeight: 14,
  },
});
