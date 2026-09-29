// Serves: R11, R13
import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StyleProp,
  ViewStyle,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme/tokens';
import { TopBar, TopBarProps } from './TopBar';
import { ErrorBoundary } from './ErrorBoundary';

export interface ScreenShellProps {
  children: React.ReactNode;
  topBarProps?: TopBarProps;
  showTopBar?: boolean;
  scrollable?: boolean;
  bottomAction?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export const ScreenShell: React.FC<ScreenShellProps> = ({
  children,
  topBarProps,
  showTopBar = true,
  scrollable = true,
  bottomAction,
  style,
  contentContainerStyle,
}) => {
  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={[styles.safeArea, style]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoid}
      >
        {showTopBar ? <TopBar {...topBarProps} /> : null}

        {scrollable ? (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <ErrorBoundary>{children}</ErrorBoundary>
          </ScrollView>
        ) : (
          <View style={[styles.fixedContent, contentContainerStyle]}>
            <ErrorBoundary>{children}</ErrorBoundary>
          </View>
        )}

        {bottomAction ? (
          <View style={styles.bottomBar}>
            {bottomAction}
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  fixedContent: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  bottomBar: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    backgroundColor: colors.paper,
    borderTopWidth: 1,
    borderTopColor: colors.outline,
    gap: spacing.sm,
  },
});
