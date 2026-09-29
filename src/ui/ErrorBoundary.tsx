// Serves: R13
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { ShieldCheck } from 'phosphor-react-native';
import { colors, radius, spacing } from '../theme/tokens';
import { Text } from './Text';
import { Button } from './Button';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error securely without exposing PII
    console.error('ErrorBoundary caught an error:', error.message, errorInfo.componentStack);
  }

  private handleGoHome = (): void => {
    this.setState({ hasError: false, error: undefined });
    try {
      router.replace('/home');
    } catch {
      // In case router navigation fails
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
  };

  private handleRetry = (): void => {
    this.setState({ hasError: false, error: undefined });
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.card}>
            <View style={styles.iconContainer}>
              <ShieldCheck size={48} color={colors.primary} weight="bold" />
            </View>

            <Text variant="title" weight="700" color={colors.ink} style={styles.title}>
              Something went wrong. Your data is safe.
            </Text>

            <Text variant="body" color={colors.inkMuted} style={styles.message}>
              All your lots, receipts, and offline records are stored safely on this device.
            </Text>

            <View style={styles.btnRow}>
              <Button
                title="Try again"
                variant="secondary"
                onPress={this.handleRetry}
                style={styles.btn}
              />
              <Button
                title="Go home"
                variant="primary"
                onPress={this.handleGoHome}
                style={styles.btn}
              />
            </View>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.paper,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outline,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    textAlign: 'center',
    lineHeight: 26,
  },
  message: {
    textAlign: 'center',
    lineHeight: 20,
  },
  btnRow: {
    width: '100%',
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  btn: {
    flex: 1,
  },
});
