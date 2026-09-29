// Serves: R03, R05, R08, R11
import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Image } from 'expo-image';
import { Check, Storefront } from 'phosphor-react-native';

import { ScreenShell } from '../../../src/ui/ScreenShell';
import { TopBar } from '../../../src/ui/TopBar';
import { Text } from '../../../src/ui/Text';
import { Button } from '../../../src/ui/Button';
import { StatusChip } from '../../../src/ui/StatusChip';
import { MoneyText } from '../../../src/ui/MoneyText';
import { Chip } from '../../../src/ui/Chip';
import { Banner } from '../../../src/ui/Banner';
import { tokens } from '../../../src/theme/tokens';
import { useT, formatDate } from '../../../src/i18n';
import { useLotStore } from '../../../src/store/useLotStore';
import { SEED_RECYCLERS } from '../../../src/data/seed/recyclers';
import { generateSeedPrices } from '../../../src/data/seed/prices';
import { detectPriceAnomaly } from '../../../src/domain/anomaly';
import { api } from '../../../src/services/mockApi';
import { getMaterialPictogram } from '../../../src/pictograms';
import { MaterialId } from '../../../src/domain/types';

export default function LotDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, lang } = useT();
  const { getLot, updateLotStatus, upsertLot } = useLotStore();

  const lot = getLot(id || '');
  const prices = useMemo(() => generateSeedPrices(), []);

  const [counterStatus, setCounterStatus] = useState<string | null>(null);
  const [loadingCounter, setLoadingCounter] = useState(false);

  const recycler = lot?.recyclerId
    ? SEED_RECYCLERS.find((r) => r.id === lot.recyclerId) || null
    : null;

  // Check for price anomaly on quoted price
  const isAnomaly =
    lot?.quoted && lot.items.length > 0
      ? detectPriceAnomaly(
          lot.items[0].materialId,
          lot.quoted / (lot.items[0].qty || 1),
          prices,
        ) === 'LOW'
      : false;

  if (!lot) {
    return (
      <ScreenShell>
        <TopBar title={t('whereIsMyLot')} onBack={() => router.replace('/home')} />
        <View style={styles.notFound}>
          <Text variant="body">{t('noLotsYet')}</Text>
          <Button title={t('back')} onPress={() => router.replace('/home')} />
        </View>
      </ScreenShell>
    );
  }

  const handleCounter = async (percent: number) => {
    if (!lot.quoted) return;
    try {
      setLoadingCounter(true);
      const asked = Math.round((lot.quoted * (1 + percent / 100)) / 10) * 10;
      const res = await api.counterOffer(lot.id, asked);

      const now = new Date().toISOString();
      const updated = {
        ...lot,
        quoted: res.quoted,
        counterAsked: asked,
        history: [
          ...lot.history,
          {
            at: now,
            status: lot.status,
            note: res.accepted
              ? `Counter accepted at ₹${res.quoted}`
              : `Counter revised to ₹${res.quoted}`,
          },
        ],
        updatedAt: now,
      };

      upsertLot(updated);
      setCounterStatus(res.accepted ? t('counterAccepted') : t('counterDeclined'));
    } finally {
      setLoadingCounter(false);
    }
  };

  const handleAcceptOffer = () => {
    updateLotStatus(lot.id, 'ACCEPTED', 'Collector accepted buyer quote');
  };

  const handleCancelLot = () => {
    Alert.alert(t('cancelLot'), t('confirmCancelLot'), [
      { text: t('back'), style: 'cancel' },
      {
        text: t('cancelLot'),
        style: 'destructive',
        onPress: () => {
          updateLotStatus(lot.id, 'CANCELLED', 'Cancelled by collector');
          router.replace('/home');
        },
      },
    ]);
  };

  const handlePrimaryAction = () => {
    switch (lot.status) {
      case 'OFFERED':
        handleAcceptOffer();
        break;
      case 'ACCEPTED':
        router.push(`/lot/${lot.id}/handover`);
        break;
      case 'HANDED_OVER':
        router.push(`/lot/${lot.id}/code`);
        break;
      case 'CONFIRMED':
        router.push(`/lot/${lot.id}/receipt`);
        break;
      case 'PAYMENT_PENDING':
      case 'PAID':
        router.push(`/lot/${lot.id}/payment`);
        break;
      default:
        break;
    }
  };

  const getPrimaryButtonTitle = () => {
    switch (lot.status) {
      case 'OFFERED':
        return t('acceptOffer');
      case 'ACCEPTED':
        return t('handOver');
      case 'HANDED_OVER':
        return t('showCode');
      case 'CONFIRMED':
        return t('receipt');
      case 'PAYMENT_PENDING':
      case 'PAID':
        return t('recordPayment');
      default:
        return t('back');
    }
  };

  const canCancel =
    lot.status === 'DRAFT' ||
    lot.status === 'VALUED' ||
    lot.status === 'OFFERED' ||
    lot.status === 'ACCEPTED';

  return (
    <ScreenShell>
      <TopBar title={t('whereIsMyLot')} onBack={() => router.replace('/home')} />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Lot Header: Reference and Status */}
        <View style={styles.headerCard}>
          <View style={styles.refRow}>
            <Text variant="heading" weight="700">
              {t('lotReference', { ref: lot.ref })}
            </Text>
            <StatusChip status={lot.status} />
          </View>

          {/* Photo Strip */}
          {lot.photos.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosStrip}>
              {lot.photos.map((p, idx) => (
                <Image key={idx} source={{ uri: p }} style={styles.photoThumb} />
              ))}
            </ScrollView>
          )}

          {/* Material Pictograms */}
          <View style={styles.pictogramsRow}>
            {lot.items.map((item) => (
              <View key={item.id} style={styles.matIconBadge}>
                {getMaterialPictogram(item.materialId as MaterialId, 36)}
              </View>
            ))}
          </View>
        </View>

        {/* Current Offer / Quote Card */}
        {lot.quoted ? (
          <View style={styles.quoteCard}>
            <View style={styles.quoteHeader}>
              <View>
                <Text variant="bodySmall" color={tokens.inkMuted}>
                  {t('currentQuote')}
                </Text>
                <MoneyText amount={lot.quoted} variant="display" />
              </View>
              {recycler && (
                <View style={styles.recyclerBadge}>
                  <Storefront size={16} color={tokens.primary} />
                  <Text variant="bodySmall" color={tokens.primary} weight="700">
                    {recycler.name}
                  </Text>
                </View>
              )}
            </View>

            {/* Anomaly warning banner if rate is suspiciously low */}
            {isAnomaly && (
              <Banner
                type="warning"
                message={t('anomalyWarning')}
                style={styles.anomalyBanner}
              />
            )}

            {/* Counter offer feedback */}
            {counterStatus && (
              <Text variant="bodySmall" color={tokens.primary} style={styles.counterMsg}>
                {counterStatus}
              </Text>
            )}

            {/* Counter Negotiation Chips (allowed in OFFERED state) */}
            {lot.status === 'OFFERED' && (
              <View style={styles.counterSection}>
                <Text variant="bodySmall" color={tokens.inkMuted}>
                  {t('askMore')}:
                </Text>
                <View style={styles.counterChips}>
                  <Chip
                    label={t('askFivePercent')}
                    selected={false}
                    onPress={loadingCounter ? () => {} : () => handleCounter(5)}
                  />
                  <Chip
                    label={t('askTenPercent')}
                    selected={false}
                    onPress={loadingCounter ? () => {} : () => handleCounter(10)}
                  />
                </View>
              </View>
            )}
          </View>
        ) : null}

        {/* Timeline of History */}
        <View style={styles.timelineSection}>
          <Text variant="label" color={tokens.inkMuted} style={styles.timelineHeading}>
            Status Timeline
          </Text>

          {lot.history.map((hist, idx) => (
            <View key={idx} style={styles.timelineItem}>
              <View style={styles.timelineDot}>
                <Check size={12} color={tokens.surface} weight="bold" />
              </View>
              <View style={styles.timelineContent}>
                <View style={styles.timelineRow}>
                  <Text variant="body" weight="700">
                    {hist.status}
                  </Text>
                  <Text variant="caption" color={tokens.inkMuted}>
                    {formatDate(hist.at, lang)}
                  </Text>
                </View>
                {hist.note && (
                  <Text variant="bodySmall" color={tokens.inkMuted}>
                    {hist.note}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Cancel Lot Button */}
        {canCancel && (
          <TouchableOpacity style={styles.cancelBtn} onPress={handleCancelLot}>
            <Text variant="body" color={tokens.danger} weight="700">
              {t('cancelLot')}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Primary Action Button */}
      {lot.status !== 'CANCELLED' && (
        <View style={styles.footer}>
          <Button
            title={getPrimaryButtonTitle()}
            variant="primary"
            onPress={handlePrimaryAction}
          />
        </View>
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  notFound: {
    padding: 24,
    alignItems: 'center',
    gap: 16,
  },
  headerCard: {
    backgroundColor: tokens.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: tokens.outline,
    padding: 16,
    marginBottom: 16,
  },
  refRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  photosStrip: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  photoThumb: {
    width: 64,
    height: 64,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: tokens.outline,
  },
  pictogramsRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  matIconBadge: {
    padding: 4,
    backgroundColor: tokens.surfaceAlt,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: tokens.outline,
  },
  quoteCard: {
    backgroundColor: tokens.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: tokens.outline,
    padding: 16,
    marginBottom: 16,
  },
  quoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  recyclerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: tokens.primaryContainer,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  anomalyBanner: {
    marginTop: 8,
    marginBottom: 8,
  },
  counterMsg: {
    marginTop: 4,
    marginBottom: 8,
  },
  counterSection: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: tokens.outline,
    paddingTop: 12,
    gap: 8,
  },
  counterChips: {
    flexDirection: 'row',
    gap: 8,
  },
  timelineSection: {
    backgroundColor: tokens.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: tokens.outline,
    padding: 16,
    marginBottom: 16,
  },
  timelineHeading: {
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  timelineItem: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  timelineDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: tokens.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  timelineContent: {
    flex: 1,
  },
  timelineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cancelBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: tokens.paper,
  },
});
