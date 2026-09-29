// Serves: R01, R09, R11, R13
import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { colors, radius, spacing } from '../theme/tokens';
import { Text } from './Text';
import { Button } from './Button';

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionTitle?: string;
  onAction?: () => void;
  lang?: 'en' | 'hi' | 'mr';
  style?: StyleProp<ViewStyle>;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionTitle,
  onAction,
  lang = 'en',
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconWrapper}>{icon}</View>
      <Text variant="heading" weight="700" lang={lang} color={colors.ink} style={styles.title}>
        {title}
      </Text>
      <Text variant="body" lang={lang} color={colors.inkMuted} style={styles.description}>
        {description}
      </Text>
      {actionTitle && onAction ? (
        <View style={styles.actionWrapper}>
          <Button title={actionTitle} onPress={onAction} variant="primary" />
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.outline,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.md,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  description: {
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  actionWrapper: {
    width: '100%',
  },
});
