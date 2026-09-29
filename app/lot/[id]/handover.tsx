// Serves: R08, R11, R15
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import {
  CheckSquare,
  Square,
  Camera,
  ShieldCheck,
  Scales,
  CurrencyInr,
  MapPin,
  Warning,
  CheckCircle,
} from 'phosphor-react-native';

import { ScreenShell } from '../../../src/ui/ScreenShell';
import { TopBar } from '../../../src/ui/TopBar';
import { Text } from '../../../src/ui/Text';
import { Button } from '../../../src/ui/Button';
import { Card } from '../../../src/ui/Card';
import { ListenButton } from '../../../src/ui/ListenButton';
import { AuthorisedBadge } from '../../../src/ui/AuthorisedBadge';
import { tokens } from '../../../src/theme/tokens';
import { useT, formatMoney, formatKg } from '../../../src/i18n';
import { useLotStore } from '../../../src/store/useLotStore';
import { useOutboxStore } from '../../../src/store/useOutboxStore';
import { useAppStore } from '../../../src/store/useAppStore';
import { repo } from '../../../src/data/repo';
import { getCurrentGeoPoint } from '../../../src/services/location';
import { processPhoto } from '../../../src/services/photos';
import {
  buildHandoverCanonical,
  computeRecordHash,
  computeShortCode,
  GENESIS_HASH,
} from '../../../src/domain/handover';
import { transitionLot } from '../../../src/domain/lotMachine';
import { GeoPoint, HandoverRecord, Lot, Recycler } from '../../../src/domain/types';

export default function LotHandoverScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, lang } = useT();

  const lots = useLotStore((s) => s.lots);
  const upsertLot = useLotStore((s) => s.upsertLot);
  const enqueueOutbox = useOutboxStore((s) => s.enqueue);
  const profile = useAppStore((s) => s.profile);

  const recyclers: Recycler[] = repo.getRecyclers();
  const lot = lots.find((l) => l.id === id);
  const recycler = recyclers.find((r) => r.id === lot?.recyclerId);

  // Checklist state
  const [weighedTogether, setWeighedTogether] = useState(false);
  const isAuthValid = recycler?.authorisation.status === 'VALID';
  const [authVerified, setAuthVerified] = useState(isAuthValid);
  const [priceAgreed, setPriceAgreed] = useState(false);
  const [handoverPhoto, setHandoverPhoto] = useState<string | null>(null);
  const [handoverPhotoHash, setHandoverPhotoHash] = useState<string | null>(null);

  // Location state
  const [geo, setGeo] = useState<{ point: GeoPoint; approximate: boolean } | null>(null);
  const [geoLoading, setGeoLoading] = useState(true);

  // Confirmation dialog
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Capture GPS on mount
  useEffect(() => {
    let mounted = true;
    getCurrentGeoPoint(profile?.locality || 'itwari')
      .then((res) => {
        if (mounted) {
          setGeo(res);
          setGeoLoading(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setGeoLoading(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, [profile?.locality]);

  if (!lot) {
    return (
      <ScreenShell>
        <TopBar title={t('readyToHandover')} showBack onBack={() => router.back()} />
        <View style={styles.errorContainer}>
          <Text variant="body" color={tokens.inkMuted}>
            Lot not found.
          </Text>
        </View>
      </ScreenShell>
    );
  }

  const quote = lot.quoted || lot.estimate?.low || 0;
  const declaredTotalWeight = lot.items.reduce((sum, item) => sum + item.qty, 0);
  const primaryUnit = lot.items[0]?.unit || 'kg';

  const formatWeightVal = (qty: number, unit: string) => {
    return unit === 'piece' ? `${qty} pcs` : formatKg(qty, lang);
  };

  const canProceed =
    weighedTogether &&
    authVerified &&
    priceAgreed &&
    Boolean(handoverPhoto);

  const handleCapturePhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.6,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const rawUri = result.assets[0].uri;
        const processed = await processPhoto(rawUri);
        setHandoverPhoto(processed.uri);
        setHandoverPhotoHash(processed.hash);
      }
    } catch (err) {
      console.warn('[Handover] Photo capture error:', err);
    }
  };

  const handleConfirmHandover = async () => {
    if (!canProceed || processing) return;

    try {
      setProcessing(true);

      // Find previous lot with handover to continue the hash chain
      const handedLots = lots
        .filter((l) => Boolean(l.handover))
        .sort((a, b) => (a.handover?.at || '').localeCompare(b.handover?.at || ''));
      const prevHash = handedLots.length > 0
        ? handedLots[handedLots.length - 1].handover!.recordHash
        : GENESIS_HASH;

      const at = new Date().toISOString();
      const photosToStore = handoverPhoto ? [...lot.photos, handoverPhoto] : lot.photos;
      const photoHashes = handoverPhotoHash ? [handoverPhotoHash] : [];

      const locationPoint = geo?.point || { lat: 21.1458, lng: 79.0882 };

      // 1. Build canonical payload
      const canonical = buildHandoverCanonical({
        at,
        collectorId: lot.collectorId,
        declaredQty: declaredTotalWeight,
        items: lot.items,
        location: locationPoint,
        lotId: lot.id,
        photoHashes,
        recyclerId: lot.recyclerId || '',
        ref: lot.ref,
        unit: primaryUnit,
      });

      // 2. Compute recordHash and code6
      const recordHash = await computeRecordHash(canonical, prevHash);
      const code6 = computeShortCode(recordHash);

      // 3. Create handover record
      const handoverRecord: HandoverRecord = {
        ref: lot.ref,
        lotId: lot.id,
        recyclerId: lot.recyclerId || '',
        photos: photosToStore,
        photoHashes,
        declaredQty: declaredTotalWeight,
        unit: primaryUnit,
        at,
        location: locationPoint,
        prevHash,
        recordHash,
        code6,
      };

      // 4. Transition lot state to HANDED_OVER (strictly locks items and photos)
      let handedOverLot: Lot = {
        ...lot,
        photos: photosToStore,
        handover: handoverRecord,
        collectedLocation: locationPoint,
      };

      handedOverLot = transitionLot(
        handedOverLot,
        'HANDED_OVER',
        `Lot handed over to recycler ${recycler?.name || lot.recyclerId}`,
        at,
      );

      // 5. Save to local store and append outbox operation
      upsertLot(handedOverLot);
      enqueueOutbox('HANDOVER', handoverRecord);

      setShowConfirmModal(false);
      // Navigate to QR and short code display (S13)
      router.replace(`/lot/${lot.id}/code`);
    } catch (err) {
      console.error('[Handover] Failed to seal handover record:', err);
      alert('Failed to seal handover. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const speakText = `${t('readyToHandover')}. ${t('checklistWeighed')}. ${t('checklistPrice', { price: formatMoney(quote) })}.`;

  return (
    <ScreenShell>
      <TopBar
        title={t('readyToHandover')}
        showBack
        onBack={() => router.back()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Listen Button Strip */}
        <View style={styles.listenStrip}>
          <ListenButton textToSpeak={speakText} lang={lang} />
        </View>

        {/* Lot & Recycler Summary Card */}
        <Card style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View>
              <Text variant="caption" color={tokens.inkMuted}>
                Lot Reference
              </Text>
              <Text variant="heading" weight="700" color={tokens.ink}>
                {lot.ref}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text variant="caption" color={tokens.inkMuted}>
                Agreed Payout
              </Text>
              <Text variant="heading" weight="700" color={tokens.money}>
                {formatMoney(quote)}
              </Text>
            </View>
          </View>

          {recycler && (
            <View style={styles.recyclerInfo}>
              <Text variant="body" weight="700" color={tokens.ink}>
                {recycler.name}
              </Text>
              <AuthorisedBadge
                validUntil={recycler.authorisation.validUntil}
                authNumber={recycler.authorisation.number}
                lang={lang}
              />
            </View>
          )}

          <View style={styles.itemsSummary}>
            <Text variant="caption" color={tokens.inkMuted}>
              Declared: {lot.items.length} materials · {formatWeightVal(declaredTotalWeight, primaryUnit)}
            </Text>
          </View>
        </Card>

        {/* Pre-Handover Checklist */}
        <Text variant="heading" weight="700" style={styles.sectionHeader}>
          Handover Checklist
        </Text>

        {/* 1. Weighed together */}
        <TouchableOpacity
          style={[styles.checkRow, weighedTogether && styles.checkRowActive]}
          onPress={() => setWeighedTogether(!weighedTogether)}
          activeOpacity={0.8}
        >
          <View style={styles.checkIconCol}>
            {weighedTogether ? (
              <CheckSquare size={24} color={tokens.primary} weight="fill" />
            ) : (
              <Square size={24} color={tokens.inkMuted} />
            )}
          </View>
          <View style={styles.checkTextCol}>
            <Text variant="body" weight="500" color={tokens.ink}>
              {t('checklistWeighed')}
            </Text>
            <Text variant="caption" color={tokens.inkMuted}>
              Zero scale together and confirm measured scrap
            </Text>
          </View>
          <Scales size={22} color={tokens.inkMuted} />
        </TouchableOpacity>

        {/* 2. Buyer is authorised */}
        <TouchableOpacity
          style={[styles.checkRow, authVerified && styles.checkRowActive]}
          onPress={() => {
            if (!isAuthValid) setAuthVerified(!authVerified);
          }}
          activeOpacity={isAuthValid ? 1 : 0.8}
        >
          <View style={styles.checkIconCol}>
            {authVerified ? (
              <CheckSquare size={24} color={tokens.success} weight="fill" />
            ) : (
              <Square size={24} color={tokens.inkMuted} />
            )}
          </View>
          <View style={styles.checkTextCol}>
            <Text variant="body" weight="500" color={tokens.ink}>
              {t('checklistAuth')}
            </Text>
            <Text variant="caption" color={tokens.success}>
              {recycler?.authorisation.number || 'MPCB Authorised'}
            </Text>
          </View>
          <ShieldCheck size={22} color={tokens.success} weight="fill" />
        </TouchableOpacity>

        {/* 3. Price agreed */}
        <TouchableOpacity
          style={[styles.checkRow, priceAgreed && styles.checkRowActive]}
          onPress={() => setPriceAgreed(!priceAgreed)}
          activeOpacity={0.8}
        >
          <View style={styles.checkIconCol}>
            {priceAgreed ? (
              <CheckSquare size={24} color={tokens.money} weight="fill" />
            ) : (
              <Square size={24} color={tokens.inkMuted} />
            )}
          </View>
          <View style={styles.checkTextCol}>
            <Text variant="body" weight="500" color={tokens.ink}>
              {t('checklistPrice', { price: formatMoney(quote) })}
            </Text>
            <Text variant="caption" color={tokens.inkMuted}>
              Both parties agree to total payment
            </Text>
          </View>
          <CurrencyInr size={22} color={tokens.money} weight="bold" />
        </TouchableOpacity>

        {/* 4. Handover photo */}
        <View style={[styles.checkRow, Boolean(handoverPhoto) && styles.checkRowActive]}>
          <View style={styles.checkIconCol}>
            {handoverPhoto ? (
              <CheckSquare size={24} color={tokens.primary} weight="fill" />
            ) : (
              <Square size={24} color={tokens.inkMuted} />
            )}
          </View>
          <View style={styles.checkTextCol}>
            <Text variant="body" weight="500" color={tokens.ink}>
              {t('checklistPhoto')}
            </Text>
            <Text variant="caption" color={tokens.inkMuted}>
              Snap scale reading or materials on handcart
            </Text>
            {handoverPhoto ? (
              <View style={styles.photoPreviewRow}>
                <Image source={{ uri: handoverPhoto }} style={styles.thumbImage} />
                <TouchableOpacity
                  style={styles.retakeBtn}
                  onPress={handleCapturePhoto}
                  activeOpacity={0.8}
                >
                  <Text variant="caption" weight="500" color={tokens.primary}>
                    Retake photo
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.takePhotoBtn}
                onPress={handleCapturePhoto}
                activeOpacity={0.8}
              >
                <Camera size={18} color={tokens.ink} />
                <Text variant="caption" weight="700" color={tokens.ink}>
                  Take Photo Now
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* GPS Capture Status */}
        <Card style={styles.geoCard}>
          <View style={styles.geoRow}>
            <MapPin size={20} color={tokens.primary} weight="bold" />
            <View style={{ flex: 1, marginLeft: 8 }}>
              {geoLoading ? (
                <Text variant="caption" color={tokens.inkMuted}>
                  Acquiring location…
                </Text>
              ) : geo?.approximate ? (
                <Text variant="caption" color={tokens.inkMuted}>
                  {t('locationApprox')} (Locality centroid)
                </Text>
              ) : (
                <Text variant="caption" color={tokens.success} weight="500">
                  {t('locationSaved')} ({geo?.point.lat.toFixed(4)}, {geo?.point.lng.toFixed(4)})
                </Text>
              )}
            </View>
            {!geoLoading && (
              <CheckCircle size={18} color={tokens.success} weight="fill" />
            )}
          </View>
        </Card>

        {/* Action Button */}
        <View style={styles.bottomBar}>
          <Button
            title="Hand Over"
            variant="primary"
            disabled={!canProceed}
            onPress={() => setShowConfirmModal(true)}
          />
        </View>
      </ScrollView>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconBox}>
              <Warning size={32} color={tokens.warning} weight="bold" />
            </View>
            <Text variant="heading" weight="700" style={styles.modalTitle}>
              Confirm Handover
            </Text>
            <Text variant="body" color={tokens.inkMuted} style={styles.modalDesc}>
              Once handed over, lot contents are cryptographically sealed in the audit chain and cannot be edited.
            </Text>
            <View style={styles.modalButtonRow}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => setShowConfirmModal(false)}
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                title={processing ? 'Sealing…' : 'Yes, Hand Over'}
                variant="primary"
                disabled={processing}
                onPress={handleConfirmHandover}
                style={{ flex: 1 }}
              />
            </View>
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
  },
  listenStrip: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  errorContainer: {
    padding: 24,
    alignItems: 'center',
  },
  summaryCard: {
    padding: 16,
    marginBottom: 20,
    backgroundColor: tokens.surface,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recyclerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: tokens.outline,
    marginBottom: 8,
  },
  itemsSummary: {
    marginTop: 4,
  },
  sectionHeader: {
    marginBottom: 12,
    color: tokens.ink,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: tokens.surface,
    borderWidth: 1,
    borderColor: tokens.outline,
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
  },
  checkRowActive: {
    borderColor: tokens.primary,
    backgroundColor: tokens.surface,
  },
  checkIconCol: {
    marginRight: 12,
    marginTop: 2,
  },
  checkTextCol: {
    flex: 1,
  },
  takePhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: tokens.outline,
    backgroundColor: tokens.paper,
    alignSelf: 'flex-start',
    gap: 6,
  },
  photoPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 12,
  },
  thumbImage: {
    width: 60,
    height: 60,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: tokens.outline,
  },
  retakeBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  geoCard: {
    marginTop: 6,
    marginBottom: 20,
    padding: 12,
    backgroundColor: tokens.surface,
  },
  geoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomBar: {
    marginTop: 10,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: tokens.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: tokens.outline,
    padding: 20,
    alignItems: 'center',
  },
  modalIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF9E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  modalDesc: {
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  modalButtonRow: {
    flexDirection: 'row',
    width: '100%',
  },
});
