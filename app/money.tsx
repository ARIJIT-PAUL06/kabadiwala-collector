// Serves: R09, R11, R14, R16
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { CheckCircle } from 'phosphor-react-native';

import { ScreenShell } from '../src/ui/ScreenShell';
import { TopBar } from '../src/ui/TopBar';
import { Text } from '../src/ui/Text';
import { Button } from '../src/ui/Button';
import { Card } from '../src/ui/Card';
import { Chip } from '../src/ui/Chip';
import { StatusChip } from '../src/ui/StatusChip';
import { ListenButton } from '../src/ui/ListenButton';
import { tokens } from '../src/theme/tokens';
import { useT, formatMoney, formatDate } from '../src/i18n';
import { useLedgerStore, LedgerEntry } from '../src/store/useLedgerStore';
import { useLotStore } from '../src/store/useLotStore';

export default function MoneyScreen() {
  const { t, lang } = useT();

  const entries = useLedgerStore((s) => s.entries);
  const markAsPaid = useLedgerStore((s) => s.markAsPaid);
  const getThisMonthEarned = useLedgerStore((s) => s.getThisMonthEarned);

  const lots = useLotStore((s) => s.lots);
  const updateLotStatus = useLotStore((s) => s.updateLotStatus);

  const [filter, setFilter] = useState<'all' | 'paid' | 'pending'>('all');
  const [copied, setCopied] = useState(false);

  // Combine ledger entries with any confirmed/paid lots from lotStore
  const combinedEntries: LedgerEntry[] = [...entries];
  for (const lot of lots) {
    if (
      (lot.status === 'PAID' || lot.status === 'PAYMENT_PENDING' || lot.status === 'CONFIRMED') &&
      !combinedEntries.some((e) => e.lotId === lot.id)
    ) {
      combinedEntries.push({
        id: `led_${lot.id}`,
        lotId: lot.id,
        ref: lot.ref,
        at: lot.updatedAt,
        amount: lot.finalPrice || lot.quoted || 0,
        method: lot.payment?.method || (lot.status === 'PAID' ? 'cash' : 'pending'),
        status: lot.status === 'PAID' ? 'paid' : 'pending',
        buyerName: lot.recyclerId || 'Authorised Recycler',
        materials: lot.items.map((i) => i.materialId),
      });
    }
  }

  // Filter entries
  const filteredEntries = combinedEntries.filter((e) => {
    if (filter === 'paid') return e.status === 'paid';
    if (filter === 'pending') return e.status === 'pending';
    return true;
  });

  const totalPaid = combinedEntries
    .filter((e) => e.status === 'paid')
    .reduce((sum, e) => sum + e.amount, 0);
  const totalPending = combinedEntries
    .filter((e) => e.status === 'pending')
    .reduce((sum, e) => sum + e.amount, 0);

  const thisMonthTotal = getThisMonthEarned() || totalPaid;

  const handleMarkAsPaid = (entry: LedgerEntry) => {
    markAsPaid(entry.lotId);
    if (lots.some((l) => l.id === entry.lotId)) {
      updateLotStatus(entry.lotId, 'PAID', 'Marked as paid from ledger');
    }
  };

  const handleShareRecord = async () => {
    const summary = `Kabadiwala Connect — Earnings Record\nTotal Received: ${formatMoney(totalPaid)}\nPending Dues: ${formatMoney(totalPending)}\nTransactions: ${combinedEntries.length}\n[DEMO DATA · TODO(field-data)]`;

    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'My Earnings Record',
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

  const speakText = `My Money overview: Total earned: ${formatMoney(totalPaid)}. Pending dues: ${formatMoney(totalPending)}. ${combinedEntries.length} total transactions recorded.`;

  return (
    <ScreenShell>
      <TopBar
        title={t('myMoney')}
        showBack
        onBack={() => router.push('/home')}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Listen Button Strip */}
        <View style={styles.listenStrip}>
          <ListenButton textToSpeak={speakText} lang={lang} />
        </View>

        {/* Big Earnings Overview Card */}
        <Card style={styles.overviewCard}>
          <Text variant="caption" color={tokens.inkMuted}>
            Total Received
          </Text>
          <Text style={styles.totalDisplay}>
            {formatMoney(totalPaid)}
          </Text>

          <View style={styles.metricsRow}>
            <View style={styles.metricCol}>
              <Text variant="caption" color={tokens.inkMuted}>
                {t('thisMonth')}
              </Text>
              <Text variant="heading" weight="700" color={tokens.ink}>
                {formatMoney(thisMonthTotal)}
              </Text>
            </View>

            <View style={styles.dividerCol} />

            <View style={styles.metricCol}>
              <Text variant="caption" color={tokens.inkMuted}>
                {t('pendingDues')}
              </Text>
              <Text variant="heading" weight="700" color={totalPending > 0 ? tokens.warning : tokens.inkMuted}>
                {formatMoney(totalPending)}
              </Text>
            </View>
          </View>
        </Card>

        {/* Filter Chips */}
        <View style={styles.chipsRow}>
          <Chip
            label={t('allTransactions')}
            selected={filter === 'all'}
            onPress={() => setFilter('all')}
          />
          <Chip
            label={t('paidFilter')}
            selected={filter === 'paid'}
            onPress={() => setFilter('paid')}
          />
          <Chip
            label={t('pendingFilter')}
            selected={filter === 'pending'}
            onPress={() => setFilter('pending')}
          />
        </View>

        {/* Transactions List */}
        <Text variant="heading" weight="700" style={styles.sectionTitle}>
          Transactions ({filteredEntries.length})
        </Text>

        {filteredEntries.map((entry) => {
          const isPending = entry.status === 'pending';

          return (
            <Card key={entry.id} style={styles.txCard}>
              <View style={styles.txHeader}>
                <View>
                  <Text variant="body" weight="700" color={tokens.ink}>
                    {entry.ref}
                  </Text>
                  <Text variant="caption" color={tokens.inkMuted}>
                    {formatDate(entry.at, lang)} · {entry.buyerName}
                  </Text>
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.txAmount, isPending && { color: tokens.warning }]}>
                    {formatMoney(entry.amount)}
                  </Text>
                  <StatusChip status={isPending ? 'PAYMENT_PENDING' : 'PAID'} />
                </View>
              </View>

              <Text variant="caption" color={tokens.inkMuted} style={styles.materialsLine}>
                Materials: {entry.materials.join(', ').toUpperCase()}
              </Text>

              {/* Mark as Paid Action if pending */}
              {isPending && (
                <View style={styles.pendingActionRow}>
                  <TouchableOpacity
                    style={styles.markPaidBtn}
                    onPress={() => handleMarkAsPaid(entry)}
                    activeOpacity={0.8}
                  >
                    <CheckCircle size={16} color={tokens.success} weight="bold" />
                    <Text variant="caption" weight="700" color={tokens.success}>
                      {t('markAsPaid')}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </Card>
          );
        })}

        {/* Share Earnings Record Button */}
        <View style={styles.bottomBar}>
          <Button
            title={copied ? 'Copied summary to clipboard ✓' : t('shareEarningsRecord')}
            variant="outline"
            onPress={handleShareRecord}
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
  overviewCard: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: tokens.surface,
  },
  totalDisplay: {
    fontSize: 36,
    fontWeight: '700',
    color: tokens.money,
    marginVertical: 8,
  },
  metricsRow: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: tokens.outline,
  },
  metricCol: {
    flex: 1,
    alignItems: 'center',
  },
  dividerCol: {
    width: 1,
    backgroundColor: tokens.outline,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 12,
    color: tokens.ink,
  },
  txCard: {
    padding: 14,
    marginBottom: 10,
    backgroundColor: tokens.surface,
  },
  txHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  txAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: tokens.money,
    marginBottom: 4,
  },
  materialsLine: {
    marginTop: 6,
  },
  pendingActionRow: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: tokens.outline,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  markPaidBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: tokens.success,
    backgroundColor: tokens.paper,
  },
  bottomBar: {
    marginTop: 16,
  },
});
