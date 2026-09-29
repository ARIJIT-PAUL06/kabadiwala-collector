// Serves: R04, R07, R11, R12
import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Storefront, Truck, MapPin } from 'phosphor-react-native';

import { ScreenShell } from '../../src/ui/ScreenShell';
import { TopBar } from '../../src/ui/TopBar';
import { Text } from '../../src/ui/Text';
import { Button } from '../../src/ui/Button';
import { AuthorisedBadge } from '../../src/ui/AuthorisedBadge';
import { MoneyText } from '../../src/ui/MoneyText';
import { Chip } from '../../src/ui/Chip';
import { EmptyState } from '../../src/ui/EmptyState';
import { tokens } from '../../src/theme/tokens';
import { useT } from '../../src/i18n';
import { useLotStore } from '../../src/store/useLotStore';
import { useOutboxStore } from '../../src/store/useOutboxStore';
import { SEED_RECYCLERS } from '../../src/data/seed/recyclers';
import { rankRecyclers, RankedRecycler, RankingReasonCode } from '../../src/domain/ranking';
import { api, OfflineError } from '../../src/services/mockApi';
import { GeoPoint } from '../../src/domain/types';

export default function SellBuyersScreen() {
  const { t, lang } = useT();
  const { activeDraft, clearDraft, upsertLot } = useLotStore();
  const enqueue = useOutboxStore((s) => s.enqueue);

  const [showAll, setShowAll] = useState(false);
  const [submittingRecyclerId, setSubmittingRecyclerId] = useState<string | null>(null);

  // Collector locality centroid or default
  const collectorLoc: GeoPoint = useMemo(() => ({ lat: 21.15, lng: 79.11 }), []);

  const rankedCandidates = useMemo(() => {
    if (!activeDraft || activeDraft.items.length === 0) return [];
    return rankRecyclers(SEED_RECYCLERS, activeDraft.items, collectorLoc);
  }, [activeDraft, collectorLoc]);

  const displayedList = showAll ? rankedCandidates : rankedCandidates.slice(0, 3);

  const getReasonLabel = (code: RankingReasonCode): string => {
    switch (code) {
      case 'BEST_RATE':
        return t('reasonBestRate');
      case 'PICKUP_TODAY':
        return t('reasonPickupToday');
      case 'NEAREST':
        return t('reasonNearest');
      case 'TAKES_ALL':
        return t('reasonTakesAll');
      case 'RELIABLE':
        return t('reasonReliable');
      default:
        return code;
    }
  };

  const handleSendToBuyer = async (candidate: RankedRecycler) => {
    if (!activeDraft) return;

    try {
      setSubmittingRecyclerId(candidate.recycler.id);
      const now = new Date().toISOString();

      let quotedPrice = candidate.totalOffer;
      try {
        const res = await api.sendOffer(activeDraft.id, candidate.recycler.id);
        quotedPrice = res.quoted;
      } catch (err) {
        if (err instanceof OfflineError) {
          // Queue in Outbox for when network returns
          enqueue('UPSERT_LOT', { lotId: activeDraft.id, recyclerId: candidate.recycler.id });
        }
      }

      const updatedLot = {
        ...activeDraft,
        recyclerId: candidate.recycler.id,
        quoted: quotedPrice,
        status: 'OFFERED' as const,
        history: [
          ...activeDraft.history,
          { at: now, status: 'OFFERED' as const, note: `Offered to ${candidate.recycler.name}` },
        ],
        updatedAt: now,
      };

      upsertLot(updatedLot);
      clearDraft();
      router.replace(`/lot/${updatedLot.id}`);
    } finally {
      setSubmittingRecyclerId(null);
    }
  };

  return (
    <ScreenShell>
      <TopBar title={t('bestBuyers')} onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text variant="heading" style={styles.title}>
            {t('bestBuyers')}
          </Text>
          <Text variant="body" color={tokens.inkMuted}>
            Authorised buyers matched to your lot
          </Text>
        </View>

        {rankedCandidates.length === 0 ? (
          <EmptyState
            icon={<Storefront size={48} color={tokens.inkMuted} />}
            title={t('noBuyersNear')}
            description=""
            actionTitle={t('back')}
            onAction={() => router.back()}
          />
        ) : (
          <>
            {displayedList.map((cand) => {
              const rec = cand.recycler;
              const isSubmitting = submittingRecyclerId === rec.id;

              return (
                <View key={rec.id} style={styles.buyerCard}>
                  {/* Name and Authorisation */}
                  <View style={styles.cardTop}>
                    <View style={styles.titleBlock}>
                      <Text variant="heading" style={styles.buyerName}>
                        {rec.name}
                      </Text>
                      <AuthorisedBadge
                        validUntil={rec.authorisation.validUntil}
                        authNumber={rec.authorisation.number}
                        lang={lang}
                      />
                    </View>
                  </View>

                  {/* Offer & Distance Row */}
                  <View style={styles.metaRow}>
                    <View style={styles.offerBlock}>
                      <Text variant="bodySmall" color={tokens.inkMuted}>
                        Offered rate:
                      </Text>
                      <MoneyText amount={cand.totalOffer} variant="title" />
                    </View>

                    <View style={styles.distanceBlock}>
                      <MapPin size={16} color={tokens.inkMuted} />
                      <Text variant="bodySmall" color={tokens.inkMuted}>
                        {t('distanceKm', { d: cand.distanceKm })}
                      </Text>
                    </View>
                  </View>

                  {/* Badges / Reason Chips */}
                  <View style={styles.chipsRow}>
                    {cand.reasons.map((r) => (
                      <Chip key={r} label={getReasonLabel(r)} selected={false} />
                    ))}
                    {rec.pickup.available && (
                      <View style={styles.pickupPill}>
                        <Truck size={14} color={tokens.primary} />
                        <Text variant="caption" color={tokens.primary} weight="700">
                          {t('pickupToday')}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Primary CTA */}
                  <Button
                    title={isSubmitting ? 'Sending…' : t('sendToBuyer')}
                    variant="primary"
                    onPress={() => handleSendToBuyer(cand)}
                    disabled={isSubmitting}
                    style={styles.sendButton}
                  />
                </View>
              );
            })}

            {/* Toggle See All */}
            {rankedCandidates.length > 3 && (
              <TouchableOpacity
                style={styles.toggleAllBtn}
                onPress={() => setShowAll(!showAll)}
              >
                <Text variant="label" color={tokens.primary} weight="700">
                  {showAll
                    ? 'Show top 3 only'
                    : t('seeAllBuyers', { n: rankedCandidates.length })}
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    marginBottom: 4,
  },
  buyerCard: {
    backgroundColor: tokens.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: tokens.outline,
    padding: 16,
    marginBottom: 16,
  },
  cardTop: {
    marginBottom: 12,
  },
  titleBlock: {
    gap: 6,
  },
  buyerName: {
    fontSize: 18,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: tokens.surfaceAlt,
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  offerBlock: {
    gap: 2,
  },
  distanceBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  pickupPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: tokens.primaryContainer,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sendButton: {
    marginTop: 4,
  },
  toggleAllBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
});
