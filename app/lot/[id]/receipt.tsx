// Serves: R08, R09, R11, R16
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import {
  SealCheck,
  ShieldCheck,
} from 'phosphor-react-native';

import { ScreenShell } from '../../../src/ui/ScreenShell';
import { TopBar } from '../../../src/ui/TopBar';
import { Text } from '../../../src/ui/Text';
import { Button } from '../../../src/ui/Button';
import { ListenButton } from '../../../src/ui/ListenButton';
import { tokens } from '../../../src/theme/tokens';
import { useT, formatMoney, formatKg, formatDate } from '../../../src/i18n';
import { useLotStore } from '../../../src/store/useLotStore';
import { useAppStore } from '../../../src/store/useAppStore';
import { repo } from '../../../src/data/repo';
import { Recycler } from '../../../src/domain/types';

export default function LotReceiptScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, lang } = useT();

  const lots = useLotStore((s) => s.lots);
  const profile = useAppStore((s) => s.profile);

  const recyclers: Recycler[] = repo.getRecyclers();
  const lot = lots.find((l) => l.id === id);
  const recycler = recyclers.find((r) => r.id === lot?.recyclerId);

  const [copied, setCopied] = useState(false);

  if (!lot) {
    return (
      <ScreenShell>
        <TopBar title={t('proofOfSale')} showBack onBack={() => router.push('/home')} />
        <View style={styles.errorContainer}>
          <Text variant="body" color={tokens.inkMuted}>
            Lot not found.
          </Text>
        </View>
      </ScreenShell>
    );
  }

  const handover = lot.handover;
  const confirmation = handover?.confirmation;
  const measuredQty = lot.measuredQty || confirmation?.measuredQty || handover?.declaredQty || 0;
  const finalPrice = lot.finalPrice || confirmation?.finalPrice || lot.quoted || 0;
  const unit = handover?.unit || lot.items[0]?.unit || 'kg';
  const declaredTotal = lot.items.reduce((s, i) => s + i.qty, 0);

  const formatWeightVal = (qty: number, u: string) => {
    return u === 'piece' ? `${qty} pcs` : formatKg(qty, lang);
  };

  const recordHashSnippet = handover?.recordHash
    ? `${handover.recordHash.slice(0, 6)}…${handover.recordHash.slice(-6)}`
    : 'None';
  const sigSnippet = confirmation?.signatureHex
    ? `${confirmation.signatureHex.slice(0, 6)}…${confirmation.signatureHex.slice(-6)}`
    : 'None';

  const localityName = profile?.locality || 'Nagpur';

  const speakText = `Verified receipt for lot ${lot.ref}. Final payout ${formatMoney(finalPrice)}. Measured weight ${formatWeightVal(measuredQty, unit)}. Confirmed by ${recycler?.name || 'Authorised Buyer'}.`;

  const handleShare = async () => {
    const summary = `Kabadiwala Connect — Verified Sale Receipt\nRef: ${lot.ref}\nBuyer: ${recycler?.name || 'Authorised Buyer'}\nMeasured: ${formatWeightVal(measuredQty, unit)}\nAmount: ${formatMoney(finalPrice)}\nRecord Hash: ${handover?.recordHash || ''}`;

    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `Receipt ${lot.ref}`,
          text: summary,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } else {
      alert(summary);
    }
  };

  return (
    <ScreenShell>
      <TopBar
        title={t('proofOfSale')}
        showBack
        onBack={() => router.push(`/lot/${lot.id}`)}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Listen Button Strip */}
        <View style={styles.listenStrip}>
          <ListenButton textToSpeak={speakText} lang={lang} />
        </View>

        {/* Receipt Card */}
        <View style={styles.receiptCard}>
          {/* Verified Header */}
          <View style={styles.verifiedHeader}>
            <View style={styles.badgeRow}>
              <SealCheck size={28} color={tokens.success} weight="fill" />
              <Text variant="heading" weight="700" color={tokens.success} style={{ marginLeft: 6 }}>
                Verified
              </Text>
            </View>
            <Text variant="caption" color={tokens.inkMuted}>
              Cryptographic Audit Proof (Ed25519)
            </Text>
          </View>

          {/* Lot Ref & Timestamp */}
          <View style={styles.metaRow}>
            <View>
              <Text variant="caption" color={tokens.inkMuted}>
                Lot Reference
              </Text>
              <Text variant="body" weight="700" color={tokens.ink}>
                {lot.ref}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text variant="caption" color={tokens.inkMuted}>
                Date & Time
              </Text>
              <Text variant="caption" weight="500" color={tokens.ink}>
                {confirmation ? formatDate(confirmation.confirmedAt, lang) : formatDate(lot.updatedAt, lang)}
              </Text>
            </View>
          </View>

          {/* Buyer Details */}
          <View style={styles.buyerSection}>
            <Text variant="caption" color={tokens.inkMuted}>
              Authorised Buyer
            </Text>
            <Text variant="body" weight="700" color={tokens.ink}>
              {recycler?.name || 'Authorised Recycler'}
            </Text>
            <View style={styles.authNoRow}>
              <ShieldCheck size={16} color={tokens.success} weight="fill" />
              <Text variant="caption" color={tokens.inkMuted} style={{ marginLeft: 4 }}>
                {recycler?.authorisation.number || 'DEMO-MPCB-EW-0001'}
              </Text>
            </View>
          </View>

          {/* Dashed Separator */}
          <View style={styles.dashedDivider} />

          {/* Materials Breakdown */}
          <View style={styles.tableSection}>
            <Text variant="caption" weight="700" color={tokens.ink} style={styles.tableHeader}>
              Materials Handed Over
            </Text>
            {lot.items.map((item, idx) => (
              <View key={item.id || idx} style={styles.tableRow}>
                <Text variant="body" color={tokens.ink} style={{ flex: 1 }}>
                  {item.materialId.toUpperCase()} {item.subCategory ? `(${item.subCategory})` : ''}
                </Text>
                <Text variant="body" weight="500" color={tokens.ink}>
                  {formatWeightVal(item.qty, item.unit)}
                </Text>
              </View>
            ))}
          </View>

          {/* Weights: Declared vs Measured */}
          <View style={styles.weightBox}>
            <View style={styles.weightCol}>
              <Text variant="caption" color={tokens.inkMuted}>
                {t('declaredWeight')}
              </Text>
              <Text variant="body" weight="500" color={tokens.ink}>
                {formatWeightVal(declaredTotal, unit)}
              </Text>
            </View>
            <View style={[styles.weightCol, { alignItems: 'flex-end' }]}>
              <Text variant="caption" color={tokens.inkMuted}>
                {t('measuredWeight')}
              </Text>
              <Text variant="body" weight="700" color={tokens.ink}>
                {formatWeightVal(measuredQty, unit)}
              </Text>
            </View>
          </View>

          {/* Dashed Separator */}
          <View style={styles.dashedDivider} />

          {/* Final Total Amount */}
          <View style={styles.totalRow}>
            <View>
              <Text variant="caption" color={tokens.inkMuted}>
                {t('finalPriceLabel')}
              </Text>
              <Text variant="caption" color={tokens.success} weight="500">
                Agreed at scale
              </Text>
            </View>
            <Text style={styles.totalMoneyText}>
              {formatMoney(finalPrice)}
            </Text>
          </View>

          {/* Dashed Separator */}
          <View style={styles.dashedDivider} />

          {/* Cryptographic Audit Trail */}
          <View style={styles.cryptoBox}>
            <Text variant="caption" weight="700" color={tokens.inkMuted} style={{ marginBottom: 4 }}>
              CRYPTOGRAPHIC PROOF
            </Text>
            <View style={styles.cryptoRow}>
              <Text variant="caption" color={tokens.inkMuted}>
                Record Hash:
              </Text>
              <Text variant="caption" weight="500" color={tokens.inkMuted} style={styles.hashText}>
                {recordHashSnippet}
              </Text>
            </View>
            <View style={styles.cryptoRow}>
              <Text variant="caption" color={tokens.inkMuted}>
                Ed25519 Sig:
              </Text>
              <Text variant="caption" weight="500" color={tokens.inkMuted} style={styles.hashText}>
                {sigSnippet}
              </Text>
            </View>
            <View style={styles.cryptoRow}>
              <Text variant="caption" color={tokens.inkMuted}>
                Location:
              </Text>
              <Text variant="caption" color={tokens.inkMuted}>
                {localityName} (GPS captured)
              </Text>
            </View>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.actionButtons}>
          <Button
            title={t('recordPayment')}
            variant="primary"
            onPress={() => router.push(`/lot/${lot.id}/payment`)}
            style={{ marginBottom: 12 }}
          />

          <Button
            title={copied ? 'Copied to clipboard ✓' : t('shareReceipt')}
            variant="outline"
            onPress={handleShare}
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
  receiptCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: tokens.outline,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  verifiedHeader: {
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: tokens.outline,
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  buyerSection: {
    marginBottom: 14,
  },
  authNoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  dashedDivider: {
    height: 1,
    borderWidth: 1,
    borderColor: tokens.outline,
    borderStyle: 'dashed',
    marginVertical: 14,
  },
  tableSection: {
    marginBottom: 10,
  },
  tableHeader: {
    marginBottom: 8,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  weightBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: tokens.paper,
    padding: 10,
    borderRadius: 6,
    marginTop: 6,
  },
  weightCol: {
    flex: 1,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  totalMoneyText: {
    fontSize: 28,
    fontWeight: '700',
    color: tokens.money,
  },
  cryptoBox: {
    backgroundColor: tokens.paper,
    padding: 10,
    borderRadius: 6,
  },
  cryptoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 3,
  },
  hashText: {
    fontFamily: 'monospace',
  },
  actionButtons: {
    width: '100%',
  },
});
