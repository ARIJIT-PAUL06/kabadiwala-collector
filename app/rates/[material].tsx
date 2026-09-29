// Serves: R02, R04, R06, R07, R11
import React, { useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import * as Crypto from 'expo-crypto';

import { ScreenShell } from '../../src/ui/ScreenShell';
import { TopBar } from '../../src/ui/TopBar';
import { Text } from '../../src/ui/Text';
import { Button } from '../../src/ui/Button';
import { Card } from '../../src/ui/Card';
import { Sparkline } from '../../src/ui/Sparkline';
import { TrendArrow } from '../../src/ui/TrendArrow';
import { ListenButton } from '../../src/ui/ListenButton';
import { AuthorisedBadge } from '../../src/ui/AuthorisedBadge';
import { getMaterialPictogram, MaterialPictogramId } from '../../src/pictograms';
import { tokens } from '../../src/theme/tokens';
import { useT, formatMoney } from '../../src/i18n';
import { TranslationKey } from '../../src/i18n/en';
import { useAppStore } from '../../src/store/useAppStore';
import { useLotStore } from '../../src/store/useLotStore';
import { repo } from '../../src/data/repo';
import { computeMaterialTrend } from '../../src/domain/trend';
import { MaterialId, Recycler } from '../../src/domain/types';

function getMaterialTranslationKey(matId: MaterialId): TranslationKey {
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

export default function MaterialDetailScreen() {
  const { material } = useLocalSearchParams<{ material: string }>();
  const { t, lang } = useT();

  const profile = useAppStore((s) => s.profile);
  const startDraft = useLotStore((s) => s.startDraft);
  const updateDraft = useLotStore((s) => s.updateDraft);

  const matId = (material || 'cable') as MaterialId;
  const prices = useMemo(() => repo.getPrices(), []);
  const recyclers: Recycler[] = useMemo(() => repo.getRecyclers(), []);

  const trend = useMemo(() => {
    return computeMaterialTrend(matId, prices, profile?.district || 'Nagpur', '2026-09-29');
  }, [matId, prices, profile?.district]);

  // Find top buyers accepting this material
  const bestBuyers = useMemo(() => {
    return recyclers
      .filter((r) => r.accepts.includes(matId) && r.authorisation.status === 'VALID')
      .sort((a, b) => (b.offers[matId] || 0) - (a.offers[matId] || 0))
      .slice(0, 3);
  }, [recyclers, matId]);

  const unit = matId === 'crt' || matId === 'lcd' ? 'piece' : 'kg';
  const unitStr = matId === 'crt' || matId === 'lcd' ? '/piece' : '/kg';

  const trendSentence =
    trend.trend === 'up'
      ? t('trendUpNote', { percent: trend.percentChange })
      : trend.trend === 'down'
      ? t('trendDownNote', { percent: Math.abs(trend.percentChange) })
      : t('trendFlatNote');

  const matTitle = t(getMaterialTranslationKey(matId));
  const speakText = `${matTitle}. Today's buying rate: ${formatMoney(trend.latestRange.low)} to ${formatMoney(trend.latestRange.high)} per ${unit}. ${trendSentence}.`;

  const handleSellThis = () => {
    const collectorId = profile?.id || 'demo-collector';
    startDraft(collectorId);
    updateDraft({
      items: [
        {
          id: Crypto.randomUUID(),
          materialId: matId,
          qty: matId === 'crt' || matId === 'lcd' ? 1 : 5,
          unit,
          condition: 'whole',
        },
      ],
    });
    router.push('/sell/photo');
  };

  return (
    <ScreenShell>
      <TopBar
        title={matTitle}
        showBack
        onBack={() => router.back()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Listen Button Strip */}
        <View style={styles.listenStrip}>
          <ListenButton textToSpeak={speakText} lang={lang} />
        </View>

        {/* Hero Card: Pictogram + Today's Price */}
        <Card style={styles.heroCard}>
          <View style={styles.pictogramCenter}>
            {getMaterialPictogram(matId as MaterialPictogramId, 64)}
          </View>
          <Text variant="heading" weight="700" color={tokens.ink} style={styles.heroTitle}>
            {matTitle}
          </Text>

          <View style={styles.priceRow}>
            <Text style={styles.priceValue}>
              {formatMoney(trend.latestRange.low)} – {formatMoney(trend.latestRange.high)}
            </Text>
            <Text variant="body" color={tokens.inkMuted} style={{ marginLeft: 6 }}>
              {unitStr}
            </Text>
          </View>

          <View style={styles.trendStrip}>
            <TrendArrow direction={trend.trend} percentChange={Math.abs(trend.percentChange)} size={22} />
            <Text variant="body" weight="500" color={tokens.ink} style={{ marginLeft: 6 }}>
              {trendSentence}
            </Text>
          </View>
        </Card>

        {/* 4-Week Sparkline Chart */}
        <Card style={styles.chartCard}>
          <Text variant="body" weight="700" color={tokens.ink} style={{ marginBottom: 12 }}>
            4-Week Price Movement
          </Text>
          <View style={{ alignItems: 'center' }}>
            <Sparkline
              data={trend.points}
              labels={['3 wks ago', '2 wks ago', 'Last wk', 'This wk']}
              width={300}
              height={100}
              color={tokens.primary}
            />
          </View>
        </Card>

        {/* Best Authorised Buyers Section */}
        <Text variant="heading" weight="700" style={styles.sectionTitle}>
          {t('bestBuyersForThis')}
        </Text>

        {bestBuyers.length > 0 ? (
          bestBuyers.map((buyer) => (
            <Card key={buyer.id} style={styles.buyerCard}>
              <View style={styles.buyerHeader}>
                <View style={{ flex: 1 }}>
                  <Text variant="body" weight="700" color={tokens.ink}>
                    {buyer.name}
                  </Text>
                  <AuthorisedBadge
                    validUntil={buyer.authorisation.validUntil}
                    authNumber={buyer.authorisation.number}
                    lang={lang}
                  />
                </View>
                <View style={styles.offerBadge}>
                  <Text variant="caption" color={tokens.inkMuted}>
                    Offers
                  </Text>
                  <Text variant="body" weight="700" color={tokens.money}>
                    {formatMoney(buyer.offers[matId] || 0)} {unitStr}
                  </Text>
                </View>
              </View>
              <Text variant="caption" color={tokens.inkMuted} style={{ marginTop: 6 }}>
                Location: {buyer.locality}, Nagpur · Radius: {buyer.serviceRadiusKm} km
              </Text>
            </Card>
          ))
        ) : (
          <Card style={styles.emptyBuyerCard}>
            <Text variant="body" color={tokens.inkMuted}>
              No verified buyers listed for this material in this area.
            </Text>
          </Card>
        )}

        {/* CTA: Sell This */}
        <View style={styles.bottomBar}>
          <Button
            title={t('sellThis')}
            variant="primary"
            onPress={handleSellThis}
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
  heroCard: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: tokens.surface,
  },
  pictogramCenter: {
    marginBottom: 10,
  },
  heroTitle: {
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  priceValue: {
    fontSize: 28,
    fontWeight: '700',
    color: tokens.money,
  },
  trendStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: tokens.paper,
    borderRadius: 8,
  },
  chartCard: {
    padding: 16,
    marginBottom: 20,
    backgroundColor: tokens.surface,
  },
  sectionTitle: {
    marginBottom: 12,
    color: tokens.ink,
  },
  buyerCard: {
    padding: 14,
    marginBottom: 10,
    backgroundColor: tokens.surface,
  },
  buyerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  offerBadge: {
    alignItems: 'flex-end',
  },
  emptyBuyerCard: {
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  bottomBar: {
    marginTop: 16,
  },
});
