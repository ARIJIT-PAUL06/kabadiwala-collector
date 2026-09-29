// Serves: R09, R11, R14
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import {
  Money,
  Clock,
  QrCode,
  CheckCircle,
} from 'phosphor-react-native';

import { ScreenShell } from '../../../src/ui/ScreenShell';
import { TopBar } from '../../../src/ui/TopBar';
import { Text } from '../../../src/ui/Text';
import { Button } from '../../../src/ui/Button';
import { Card } from '../../../src/ui/Card';
import { ListenButton } from '../../../src/ui/ListenButton';
import { tokens } from '../../../src/theme/tokens';
import { useT, formatMoney } from '../../../src/i18n';
import { useLotStore } from '../../../src/store/useLotStore';
import { useOutboxStore } from '../../../src/store/useOutboxStore';
import { useAppStore } from '../../../src/store/useAppStore';
import { transitionLot } from '../../../src/domain/lotMachine';
import { Lot, Payment } from '../../../src/domain/types';

export default function LotPaymentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, lang } = useT();

  const lots = useLotStore((s) => s.lots);
  const upsertLot = useLotStore((s) => s.upsertLot);
  const enqueueOutbox = useOutboxStore((s) => s.enqueue);
  const upiEnabled = useAppStore((s) => s.upiEnabled);

  const lot = lots.find((l) => l.id === id);

  const defaultAmount = lot?.finalPrice || lot?.quoted || 1000;
  const [amount, setAmount] = useState<number>(defaultAmount);
  const [method, setMethod] = useState<'cash' | 'pending' | 'upi'>('cash');
  const [upiRefLast4, setUpiRefLast4] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!lot) {
    return (
      <ScreenShell>
        <TopBar title={t('didYouGetPaid')} showBack onBack={() => router.push('/home')} />
        <View style={styles.errorContainer}>
          <Text variant="body" color={tokens.inkMuted}>
            Lot not found.
          </Text>
        </View>
      </ScreenShell>
    );
  }

  const handleAdjustAmount = (delta: number) => {
    setAmount((prev) => Math.max(10, prev + delta));
  };

  const handleSavePayment = () => {
    try {
      setIsSaving(true);
      const at = new Date().toISOString();

      const paymentRecord: Payment = {
        method,
        amount,
        at,
        upiRefLast4: method === 'upi' ? upiRefLast4.trim() : undefined,
      };

      const nextStatus = method === 'pending' ? 'PAYMENT_PENDING' : 'PAID';

      let updatedLot: Lot = {
        ...lot,
        payment: paymentRecord,
      };

      // Transition lot status
      if (lot.status !== nextStatus) {
        updatedLot = transitionLot(
          updatedLot,
          nextStatus,
          `Payment recorded: ${method} (${formatMoney(amount)})`,
          at,
        );
      }

      upsertLot(updatedLot);
      enqueueOutbox('PAYMENT', {
        lotId: lot.id,
        payment: paymentRecord,
      });

      // Route back to home
      router.replace('/home');
    } catch (err) {
      console.error('[Payment] Failed to save payment:', err);
      alert('Failed to save payment.');
    } finally {
      setIsSaving(false);
    }
  };

  const speakText = `${t('didYouGetPaid')} ${formatMoney(amount)}. Option 1: Cash received. Option 2: Not paid yet. Option 3: Paid by UPI.`;

  return (
    <ScreenShell>
      <TopBar
        title={t('didYouGetPaid')}
        showBack
        onBack={() => router.back()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Listen Button Strip */}
        <View style={styles.listenStrip}>
          <ListenButton textToSpeak={speakText} lang={lang} />
        </View>

        {/* Amount Stepper Card */}
        <Card style={styles.amountCard}>
          <Text variant="caption" color={tokens.inkMuted} style={styles.amountLabel}>
            Payment Amount
          </Text>
          <Text style={styles.amountDisplay}>
            {formatMoney(amount)}
          </Text>

          {/* Steppers: ±10 and ±50 */}
          <View style={styles.stepperRow}>
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => handleAdjustAmount(-50)}
              activeOpacity={0.8}
            >
              <Text variant="caption" weight="700" color={tokens.ink}>
                −50
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => handleAdjustAmount(-10)}
              activeOpacity={0.8}
            >
              <Text variant="caption" weight="700" color={tokens.ink}>
                −10
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => handleAdjustAmount(10)}
              activeOpacity={0.8}
            >
              <Text variant="caption" weight="700" color={tokens.ink}>
                +10
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => handleAdjustAmount(50)}
              activeOpacity={0.8}
            >
              <Text variant="caption" weight="700" color={tokens.ink}>
                +50
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* 3 Payment Method Choices */}
        <Text variant="heading" weight="700" style={styles.sectionTitle}>
          Payment Method
        </Text>

        {/* 1. Cash received (default) */}
        <TouchableOpacity
          style={[styles.methodCard, method === 'cash' && styles.methodCardActive]}
          onPress={() => setMethod('cash')}
          activeOpacity={0.8}
        >
          <View style={styles.methodIconBox}>
            <Money size={28} color={tokens.money} weight="bold" />
          </View>
          <View style={styles.methodInfo}>
            <Text variant="body" weight="700" color={tokens.ink}>
              Cash Received (रोख)
            </Text>
            <Text variant="caption" color={tokens.inkMuted}>
              Paid in full at handover. Closes transaction.
            </Text>
          </View>
          {method === 'cash' && (
            <CheckCircle size={22} color={tokens.primary} weight="fill" />
          )}
        </TouchableOpacity>

        {/* 2. Not paid yet (pending) */}
        <TouchableOpacity
          style={[styles.methodCard, method === 'pending' && styles.methodCardActive]}
          onPress={() => setMethod('pending')}
          activeOpacity={0.8}
        >
          <View style={[styles.methodIconBox, { backgroundColor: '#FFF5F0' }]}>
            <Clock size={28} color={tokens.warning} weight="bold" />
          </View>
          <View style={styles.methodInfo}>
            <Text variant="body" weight="700" color={tokens.ink}>
              Not Paid Yet (बाकी)
            </Text>
            <Text variant="caption" color={tokens.inkMuted}>
              Buyer will pay later. Saved as pending dues.
            </Text>
          </View>
          {method === 'pending' && (
            <CheckCircle size={22} color={tokens.primary} weight="fill" />
          )}
        </TouchableOpacity>

        {/* 3. Paid by UPI (shown when upiEnabled or opt-in) */}
        {(upiEnabled || true) && (
          <TouchableOpacity
            style={[styles.methodCard, method === 'upi' && styles.methodCardActive]}
            onPress={() => setMethod('upi')}
            activeOpacity={0.8}
          >
            <View style={[styles.methodIconBox, { backgroundColor: '#F0F7FF' }]}>
              <QrCode size={28} color={tokens.primary} weight="bold" />
            </View>
            <View style={styles.methodInfo}>
              <Text variant="body" weight="700" color={tokens.ink}>
                Paid by UPI
              </Text>
              <Text variant="caption" color={tokens.inkMuted}>
                Bank or wallet digital transfer.
              </Text>

              {method === 'upi' && (
                <View style={styles.upiInputBox}>
                  <Text variant="caption" color={tokens.inkMuted} style={{ marginBottom: 4 }}>
                    {t('upiReferenceLast4')}
                  </Text>
                  <TextInput
                    style={styles.upiField}
                    placeholder="e.g. 8492"
                    value={upiRefLast4}
                    onChangeText={setUpiRefLast4}
                    keyboardType="numeric"
                    maxLength={4}
                  />
                </View>
              )}
            </View>
            {method === 'upi' && (
              <CheckCircle size={22} color={tokens.primary} weight="fill" />
            )}
          </TouchableOpacity>
        )}

        {/* Save Button */}
        <View style={styles.saveSection}>
          <Button
            title={isSaving ? 'Saving…' : t('savePayment')}
            variant="primary"
            disabled={isSaving}
            onPress={handleSavePayment}
          />
        </View>
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  listenStrip: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  errorContainer: {
    padding: 24,
    alignItems: 'center',
  },
  amountCard: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: tokens.surface,
  },
  amountLabel: {
    marginBottom: 4,
  },
  amountDisplay: {
    fontSize: 36,
    fontWeight: '700',
    color: tokens.money,
    marginBottom: 16,
  },
  stepperRow: {
    flexDirection: 'row',
    gap: 12,
  },
  stepBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: tokens.outline,
    borderRadius: 8,
    backgroundColor: tokens.paper,
  },
  sectionTitle: {
    marginBottom: 12,
    color: tokens.ink,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.surface,
    borderWidth: 1,
    borderColor: tokens.outline,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  methodCardActive: {
    borderColor: tokens.primary,
    borderWidth: 2,
  },
  methodIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  methodInfo: {
    flex: 1,
  },
  upiInputBox: {
    marginTop: 10,
  },
  upiField: {
    backgroundColor: tokens.paper,
    borderWidth: 1,
    borderColor: tokens.outline,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 16,
    color: tokens.ink,
  },
  saveSection: {
    marginTop: 16,
  },
});
