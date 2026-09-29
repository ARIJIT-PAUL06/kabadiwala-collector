// Serves: R08, R11, R16
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import {
  Sparkle,
  Scales,
  CurrencyInr,
} from 'phosphor-react-native';

import { ScreenShell } from '../../../src/ui/ScreenShell';
import { TopBar } from '../../../src/ui/TopBar';
import { Text } from '../../../src/ui/Text';
import { Button } from '../../../src/ui/Button';
import { Card } from '../../../src/ui/Card';
import { ListenButton } from '../../../src/ui/ListenButton';
import { tokens } from '../../../src/theme/tokens';
import { useT, formatMoney, formatKg } from '../../../src/i18n';
import { useLotStore } from '../../../src/store/useLotStore';
import { useOutboxStore } from '../../../src/store/useOutboxStore';
import { useAppStore } from '../../../src/store/useAppStore';
import { repo } from '../../../src/data/repo';
import { generateQrPayload } from '../../../src/domain/handover';
import { demoRecycler } from '../../../src/services/demoRecycler';
import { Recycler } from '../../../src/domain/types';

export default function LotCodeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, lang } = useT();

  const lots = useLotStore((s) => s.lots);
  const upsertLot = useLotStore((s) => s.upsertLot);
  const enqueueOutbox = useOutboxStore((s) => s.enqueue);
  const demoMode = useAppStore((s) => s.demoMode);

  const recyclers: Recycler[] = repo.getRecyclers();
  const lot = lots.find((l) => l.id === id);
  const recycler = recyclers.find((r) => r.id === lot?.recyclerId);

  // Demo buyer modal
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [enteredCode, setEnteredCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSigning, setIsSigning] = useState(false);

  const lotStatus = lot?.status;
  const lotId = lot?.id;

  // Auto-navigate to receipt (S14) when lot becomes CONFIRMED
  useEffect(() => {
    if (lotId && (lotStatus === 'CONFIRMED' || lotStatus === 'PAID' || lotStatus === 'PAYMENT_PENDING')) {
      const timer = setTimeout(() => {
        router.replace(`/lot/${lotId}/receipt`);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [lotStatus, lotId]);

  if (!lot || !lot.handover) {
    return (
      <ScreenShell>
        <TopBar title="Handover Code" showBack onBack={() => router.back()} />
        <View style={styles.errorContainer}>
          <Text variant="body" color={tokens.inkMuted}>
            Handover record not found. Please initiate handover first.
          </Text>
          <Button
            title="Go to Handover"
            variant="primary"
            onPress={() => router.replace(`/lot/${id}/handover`)}
            style={{ marginTop: 16 }}
          />
        </View>
      </ScreenShell>
    );
  }

  const { ref, recordHash, code6, declaredQty, unit } = lot.handover;
  const qrPayload = generateQrPayload(ref, recordHash, code6);

  const formatWeightVal = (qty: number, u: string) => {
    return u === 'piece' ? `${qty} pcs` : formatKg(qty, lang);
  };

  // Format code with space: 482 913
  const splitCode = code6.length === 6 ? `${code6.slice(0, 3)} ${code6.slice(3)}` : code6;

  // Spoken representation for low-literacy users
  const spokenDigits = code6.split('').join(' ');
  const speakText = `${t('waitingForBuyerScan')}. ${t('enter6DigitCode')}: ${spokenDigits}.`;

  const handleOpenDemo = () => {
    setEnteredCode(code6); // Pre-fill for seamless live SIH demonstration
    setErrorMsg('');
    setShowDemoModal(true);
  };

  const handleExecuteDemoConfirmation = () => {
    try {
      setIsSigning(true);
      setErrorMsg('');

      const { confirmedLot, confirmation } = demoRecycler.confirmHandover(lot, enteredCode);
      upsertLot(confirmedLot);

      enqueueOutbox('HANDOVER', {
        lotId: lot.id,
        confirmation,
      });

      setShowDemoModal(false);
      // Navigation is triggered by useEffect on status change
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid code or signature failure';
      setErrorMsg(msg);
    } finally {
      setIsSigning(false);
    }
  };

  return (
    <ScreenShell>
      <TopBar
        title="Handover Code"
        showBack
        onBack={() => router.push(`/lot/${lot.id}`)}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Listen Button Strip */}
        <View style={styles.listenStrip}>
          <ListenButton textToSpeak={speakText} lang={lang} />
        </View>

        {/* Buyer Info Strip */}
        <View style={styles.buyerStrip}>
          <Text variant="caption" color={tokens.inkMuted}>
            Present this to:
          </Text>
          <Text variant="body" weight="700" color={tokens.ink}>
            {recycler?.name || 'Authorised Buyer'}
          </Text>
        </View>

        {/* 240px High Contrast QR Container */}
        <View style={styles.qrContainer}>
          <View style={styles.qrFrame}>
            <QRCode
              value={qrPayload}
              size={220}
              color={tokens.ink}
              backgroundColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Split 6-digit Code */}
        <View style={styles.codeContainer}>
          <Text variant="caption" color={tokens.inkMuted} style={styles.codeSubtitle}>
            Or share 6-digit verification code:
          </Text>
          <View style={styles.codePill}>
            <Text style={styles.codeText}>
              {splitCode}
            </Text>
          </View>
          <Text variant="caption" color={tokens.inkMuted} style={styles.refText}>
            Ref: {ref}
          </Text>
        </View>

        {/* Waiting Status Indicator */}
        <View style={styles.waitingStrip}>
          <ActivityIndicator size="small" color={tokens.primary} style={{ marginRight: 8 }} />
          <Text variant="body" weight="500" color={tokens.primary}>
            {t('waitingForBuyerScan')}
          </Text>
        </View>

        {/* Demo Simulator Action (Visible in demoMode) */}
        {demoMode && (
          <View style={styles.demoSection}>
            <TouchableOpacity
              style={styles.demoButton}
              onPress={handleOpenDemo}
              activeOpacity={0.8}
            >
              <Sparkle size={18} color={tokens.primary} weight="bold" />
              <Text variant="body" weight="700" color={tokens.primary}>
                {t('demoActAsBuyer')}
              </Text>
            </TouchableOpacity>
            <Text variant="caption" color={tokens.inkMuted} style={styles.demoNote}>
              DEMO DATA: Simulates authorized buyer scanning QR & signing with Ed25519 key.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Demo Recycler Simulator Modal */}
      <Modal
        visible={showDemoModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDemoModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View>
                <Text variant="caption" color={tokens.primary} weight="700">
                  DEMO SIMULATOR
                </Text>
                <Text variant="heading" weight="700" color={tokens.ink}>
                  Buyer Handover Scan
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowDemoModal(false)}>
                <Text variant="body" color={tokens.inkMuted}>
                  ✕
                </Text>
              </TouchableOpacity>
            </View>

            <Text variant="caption" color={tokens.inkMuted} style={{ marginBottom: 16 }}>
              Acting as {recycler?.name || 'GreenCycle Recyclers'} ({recycler?.authorisation.number || 'MPCB Valid'}).
            </Text>

            {/* Code Input */}
            <Text variant="caption" weight="700" color={tokens.ink} style={{ marginBottom: 6 }}>
              {t('enter6DigitCode')}
            </Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.codeField}
                value={enteredCode}
                onChangeText={setEnteredCode}
                keyboardType="numeric"
                maxLength={6}
                placeholder="482913"
              />
              <TouchableOpacity
                style={styles.fillCodeBtn}
                onPress={() => setEnteredCode(code6)}
                activeOpacity={0.8}
              >
                <Text variant="caption" weight="700" color={tokens.primary}>
                  Auto Fill
                </Text>
              </TouchableOpacity>
            </View>

            {/* Simulated Measurement Specs */}
            <Card style={styles.simCard}>
              <View style={styles.simRow}>
                <Scales size={18} color={tokens.inkMuted} />
                <Text variant="caption" color={tokens.inkMuted} style={{ flex: 1, marginLeft: 8 }}>
                  Scale Reading (Measured):
                </Text>
                <Text variant="caption" weight="700" color={tokens.ink}>
                  {formatWeightVal(Math.round(declaredQty * 0.98 * 10) / 10, unit)}
                </Text>
              </View>
              <View style={[styles.simRow, { marginTop: 8 }]}>
                <CurrencyInr size={18} color={tokens.money} weight="bold" />
                <Text variant="caption" color={tokens.inkMuted} style={{ flex: 1, marginLeft: 8 }}>
                  Agreed Payout:
                </Text>
                <Text variant="body" weight="700" color={tokens.money}>
                  {formatMoney(lot.quoted || 0)}
                </Text>
              </View>
            </Card>

            {errorMsg ? (
              <Text variant="caption" color={tokens.danger} style={{ marginBottom: 12 }}>
                {errorMsg}
              </Text>
            ) : null}

            {/* Confirm & Sign CTA */}
            <Button
              title={isSigning ? 'Signing Ed25519…' : t('confirmByBuyer')}
              variant="primary"
              disabled={isSigning || enteredCode.length !== 6}
              onPress={handleExecuteDemoConfirmation}
            />
          </View>
        </View>
      </Modal>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    alignItems: 'center',
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
  buyerStrip: {
    alignItems: 'center',
    marginBottom: 20,
  },
  qrContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: tokens.outline,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrFrame: {
    padding: 8,
    backgroundColor: '#FFFFFF',
  },
  codeContainer: {
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  codeSubtitle: {
    marginBottom: 8,
  },
  codePill: {
    backgroundColor: tokens.surface,
    borderWidth: 1,
    borderColor: tokens.outline,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
    marginBottom: 6,
  },
  codeText: {
    fontSize: 34,
    fontWeight: '700',
    color: tokens.ink,
    letterSpacing: 4,
    fontFamily: 'monospace',
  },
  refText: {
    marginTop: 4,
  },
  waitingStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.surface,
    borderWidth: 1,
    borderColor: tokens.outline,
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  demoSection: {
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: tokens.primary,
    backgroundColor: tokens.surface,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    width: '100%',
    maxWidth: 320,
  },
  demoNote: {
    marginTop: 8,
    textAlign: 'center',
    maxWidth: 300,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: tokens.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    borderColor: tokens.outline,
    padding: 20,
    paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  codeField: {
    flex: 1,
    backgroundColor: tokens.paper,
    borderWidth: 1,
    borderColor: tokens.outline,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 4,
    color: tokens.ink,
  },
  fillCodeBtn: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: tokens.surface,
    borderWidth: 1,
    borderColor: tokens.primary,
    borderRadius: 8,
  },
  simCard: {
    padding: 12,
    marginBottom: 16,
    backgroundColor: tokens.paper,
  },
  simRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
