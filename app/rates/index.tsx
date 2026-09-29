// Serves: R02, R06, R11, R16
import React, { useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { SpeakerHigh } from 'phosphor-react-native';

import { ScreenShell } from '../../src/ui/ScreenShell';
import { TopBar } from '../../src/ui/TopBar';
import { Text } from '../../src/ui/Text';
import { Card } from '../../src/ui/Card';
import { Banner } from '../../src/ui/Banner';
import { TrendArrow } from '../../src/ui/TrendArrow';
import { ListenButton } from '../../src/ui/ListenButton';
import { getMaterialPictogram, MaterialPictogramId } from '../../src/pictograms';
import { tokens } from '../../src/theme/tokens';
import { useT, formatMoney, formatDate } from '../../src/i18n';
import { TranslationKey } from '../../src/i18n/en';
import { useAppStore } from '../../src/store/useAppStore';
import { repo } from '../../src/data/repo';
import { computeMaterialTrend, MaterialTrend } from '../../src/domain/trend';
import { MaterialId } from '../../src/domain/types';
import { speak } from '../../src/services/speech';

const MATERIALS: MaterialId[] = [
  'cable',
  'pcb',
  'battery',
  'crt',
  'lcd',
  'motor',
  'magnet',
  'plastic',
  'other',
];

export function getMaterialTranslationKey(matId: MaterialId): TranslationKey {
  const map: Record<MaterialId, TranslationKey> = {
    crt: 'matCrt',
    lcd: 'matLcd',
    pcb: 'matPcb',
    cable: 'matCable',
    battery: 'matBattery',
    motor: 'matMotor',
    magnet: 'matMagnet',
    plastic: 'matPlastic',
    other: 'matOther',
  };
  return map[matId];
}

export default function RatesScreen() {
  const { t, lang } = useT();
  const profile = useAppStore((s) => s.profile);

  const prices = useMemo(() => repo.getPrices(), []);
  const locality = profile?.locality || 'Nagpur';
  const district = profile?.district || 'Nagpur';

  // Compute trends for all 9 materials
  const trends: MaterialTrend[] = useMemo(() => {
    return MATERIALS.map((matId) =>
      computeMaterialTrend(matId, prices, district, '2026-09-29'),
    );
  }, [prices, district]);

  const isAnyStale = trends.some((tr) => tr.isStale);
  const freshestDate = trends[0]?.freshestDate || '2026-09-29';

  const [isReadingAll, setIsReadingAll] = useState(false);

  const handleListenToAll = async () => {
    try {
      setIsReadingAll(true);
      const textParts = trends.map((tr) => {
        const matName = t(getMaterialTranslationKey(tr.materialId));
        const unit = tr.materialId === 'crt' || tr.materialId === 'lcd' ? 'piece' : 'kg';
        const trendWord =
          tr.trend === 'up'
            ? t('trendUpNote', { percent: tr.percentChange })
            : tr.trend === 'down'
            ? t('trendDownNote', { percent: Math.abs(tr.percentChange) })
            : t('trendFlatNote');
        return `${matName}: ${formatMoney(tr.latestRange.low)} to ${formatMoney(tr.latestRange.high)} per ${unit}. ${trendWord}.`;
      });

      const fullScript = `${t('todayIn', { place: locality })}. ` + textParts.join(' ');
      await speak(fullScript, lang);
    } finally {
      setIsReadingAll(false);
    }
  };

  return (
    <ScreenShell>
      <TopBar
        title={t('todaysRates')}
        showBack
        onBack={() => router.push('/home')}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Strip with Date and Listen to all */}
        <View style={styles.headerStrip}>
          <View>
            <Text variant="heading" weight="700" color={tokens.ink}>
              {t('todayIn', { place: locality })}
            </Text>
            <Text variant="caption" color={tokens.inkMuted}>
              {formatDate(new Date(), lang)}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.listenAllBtn}
            onPress={handleListenToAll}
            disabled={isReadingAll}
            activeOpacity={0.8}
          >
            <SpeakerHigh size={18} color={tokens.primary} weight="bold" />
            <Text variant="caption" weight="700" color={tokens.primary}>
              {isReadingAll ? 'Reading…' : t('listenToAll')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stale Warning Banner if applicable */}
        {isAnyStale && (
          <Banner
            type="info"
            message={t('ratesFromDate', { date: formatDate(freshestDate, lang) })}
            style={styles.staleBanner}
          />
        )}

        {/* List of 9 Material Rate Rows */}
        <View style={styles.ratesList}>
          {trends.map((tr) => {
            const matId = tr.materialId;
            const unit = matId === 'crt' || matId === 'lcd' ? '/piece' : '/kg';
            const rateStr = `${formatMoney(tr.latestRange.low)} – ${formatMoney(tr.latestRange.high)} ${unit}`;
            const rowSpoken = `${t(getMaterialTranslationKey(matId))}. ${rateStr}.`;

            return (
              <TouchableOpacity
                key={matId}
                style={styles.rateRow}
                onPress={() => router.push(`/rates/${matId}`)}
                activeOpacity={0.7}
              >
                {/* Pictogram */}
                <View style={styles.pictogramBox}>
                  {getMaterialPictogram(matId as MaterialPictogramId, 38)}
                </View>

                {/* Name & Range */}
                <View style={styles.nameCol}>
                  <Text variant="body" weight="700" color={tokens.ink}>
                    {t(getMaterialTranslationKey(matId))}
                  </Text>
                  <Text variant="body" weight="500" color={tokens.money}>
                    {rateStr}
                  </Text>
                </View>

                {/* Trend Arrow */}
                <View style={styles.trendCol}>
                  <TrendArrow
                    direction={tr.trend}
                    percentChange={Math.abs(tr.percentChange)}
                    showPercent={tr.trend !== 'flat'}
                    size={20}
                  />
                </View>

                {/* Listen Row Audio */}
                <View style={styles.audioCol}>
                  <ListenButton textToSpeak={rowSpoken} lang={lang} size={32} />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Source Info & Demo Tag */}
        <Card style={styles.sourceCard}>
          <Text variant="caption" color={tokens.inkMuted} style={styles.sourceText}>
            Source: Regional APMC & registered scrap aggregator daily board.
          </Text>
          <View style={styles.demoTag}>
            <Text variant="caption" weight="700" color={tokens.primary}>
              DEMO DATA · TODO(field-data)
            </Text>
          </View>
        </Card>
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  headerStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  listenAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: tokens.primary,
    backgroundColor: tokens.surface,
  },
  staleBanner: {
    marginBottom: 14,
  },
  ratesList: {
    backgroundColor: tokens.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: tokens.outline,
    overflow: 'hidden',
    marginBottom: 20,
  },
  rateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: tokens.outline,
  },
  pictogramBox: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  nameCol: {
    flex: 1,
  },
  trendCol: {
    marginRight: 10,
    minWidth: 50,
    alignItems: 'flex-end',
  },
  audioCol: {
    justifyContent: 'center',
  },
  sourceCard: {
    padding: 14,
    backgroundColor: tokens.paper,
    alignItems: 'center',
  },
  sourceText: {
    textAlign: 'center',
    marginBottom: 6,
  },
  demoTag: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: '#E8F5E9',
  },
});
