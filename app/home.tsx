// Serves: R01, R06, R09, R10, R11, R12
import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { CurrencyInr, CaretRight } from 'phosphor-react-native';
import { colors, radius, spacing } from '../src/theme/tokens';
import { Text } from '../src/ui/Text';
import { Tile } from '../src/ui/Tile';
import { Card } from '../src/ui/Card';
import { StatusChip } from '../src/ui/StatusChip';
import { EmptyState } from '../src/ui/EmptyState';
import { ScreenShell } from '../src/ui/ScreenShell';
import { useAppStore } from '../src/store/useAppStore';
import { useLotStore } from '../src/store/useLotStore';
import { useLedgerStore } from '../src/store/useLedgerStore';
import { useOutboxStore } from '../src/store/useOutboxStore';
import { useT } from '../src/i18n';
import { MaterialPictograms, getMaterialPictogram } from '../src/pictograms';
import { SafetyPictograms } from '../src/pictograms/safety';
import { formatIndianRupees } from '../src/ui/MoneyText';

export default function HomeScreen() {
  const router = useRouter();
  const { lang, setLang, simulateOffline } = useAppStore();
  const { lots } = useLotStore();
  const { getPendingDues, getPendingCount } = useLedgerStore();
  const { getPendingCount: getOutboxPendingCount } = useOutboxStore();
  const { t } = useT();

  const pendingDues = getPendingDues();
  const pendingBuyersCount = getPendingCount();
  const outboxCount = getOutboxPendingCount();

  const syncState = simulateOffline ? 'offline' : outboxCount > 0 ? 'pending' : 'synced';

  const toggleLanguage = () => {
    const cycle: Record<string, 'mr' | 'hi' | 'en'> = {
      mr: 'hi',
      hi: 'en',
      en: 'mr',
    };
    setLang(cycle[lang] || 'mr');
  };

  const recentLots = lots.slice(0, 5);

  return (
    <ScreenShell
      topBarProps={{
        title: t('appName'),
        showBack: false,
        onLanguagePress: toggleLanguage,
        onSettingsPress: () => router.push('/settings'),
        onSyncPress: () => router.push('/settings'),
        syncState,
        pendingSyncCount: outboxCount,
        lang,
      }}
    >
      {/* Pending Money Strip */}
      {pendingDues > 0 ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Pending money: ${pendingDues} rupees`}
          onPress={() => router.push('/money')}
          style={({ pressed }) => [styles.moneyStrip, pressed && styles.pressed]}
        >
          <View style={styles.moneyStripLeft}>
            <View style={styles.moneyIconCircle}>
              <CurrencyInr size={20} color={colors.money} weight="bold" />
            </View>
            <Text variant="label" weight="700" color={colors.money} lang={lang}>
              {t('pendingBannerText', {
                amount: formatIndianRupees(pendingDues).replace('₹', ''),
                count: pendingBuyersCount,
              })}
            </Text>
          </View>
          <CaretRight size={20} color={colors.money} weight="bold" />
        </Pressable>
      ) : null}

      {/* 2 x 2 Action Tiles Grid */}
      <View style={styles.tileGrid}>
        <View style={styles.tileRow}>
          <View style={styles.tileCol}>
            <Tile
              label={t('sell')}
              subLabel="New lot"
              icon={<MaterialPictograms.other size={44} />}
              isPrimary={true}
              onPress={() => router.push('/sell/photo')}
              lang={lang}
            />
          </View>
          <View style={styles.tileCol}>
            <Tile
              label={t('todaysRates')}
              subLabel="Daily board"
              icon={<MaterialPictograms.pcb size={44} />}
              onPress={() => router.push('/rates')}
              lang={lang}
            />
          </View>
        </View>

        <View style={styles.tileRow}>
          <View style={styles.tileCol}>
            <Tile
              label={t('myMoney')}
              subLabel="Ledger"
              icon={<MaterialPictograms.cable size={44} />}
              onPress={() => router.push('/money')}
              lang={lang}
            />
          </View>
          <View style={styles.tileCol}>
            <Tile
              label={t('safety')}
              subLabel="Safety cards"
              icon={<SafetyPictograms.gloves_mask size={44} />}
              onPress={() => router.push('/safety')}
              lang={lang}
            />
          </View>
        </View>
      </View>

      {/* My Lots Section */}
      <View style={styles.lotsSection}>
        <Text variant="heading" weight="700" lang={lang} style={styles.sectionTitle}>
          {t('myLots')}
        </Text>

        {recentLots.length === 0 ? (
          <EmptyState
            icon={<MaterialPictograms.other size={48} />}
            title={t('noLotsYet')}
            description=""
            actionTitle={t('sell')}
            onAction={() => router.push('/sell/photo')}
            lang={lang}
          />
        ) : (
          <View style={styles.lotList}>
            {recentLots.map((lot) => {
              const primaryMaterial = lot.items[0]?.materialId || 'other';
              return (
                <Card
                  key={lot.id}
                  onPress={() => router.push({ pathname: '/lot/[id]', params: { id: lot.id } })}
                  style={styles.lotCard}
                >
                  <View style={styles.lotRow}>
                    <View style={styles.lotIcon}>
                      {getMaterialPictogram(primaryMaterial, 40)}
                    </View>
                    <View style={styles.lotInfo}>
                      <View style={styles.lotTopLine}>
                        <Text variant="label" weight="700">
                          {lot.ref}
                        </Text>
                        <StatusChip status={lot.status} lang={lang} />
                      </View>
                      <Text variant="caption" color={colors.inkMuted}>
                        {lot.items.length} {t('pieces')} ·{' '}
                        {new Date(lot.collectedAt).toLocaleDateString()}
                      </Text>
                      {lot.finalPrice ? (
                        <Text variant="label" weight="700" color={colors.money}>
                          {formatIndianRupees(lot.finalPrice)}
                        </Text>
                      ) : lot.estimate ? (
                        <Text variant="label" weight="700" color={colors.money}>
                          {formatIndianRupees(lot.estimate.low)} –{' '}
                          {formatIndianRupees(lot.estimate.high)}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                </Card>
              );
            })}
          </View>
        )}
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  moneyStrip: {
    backgroundColor: colors.moneyContainer,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#E6C8A6',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  moneyStripLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  moneyIconCircle: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
  tileGrid: {
    gap: spacing.md,
    marginVertical: spacing.xs,
  },
  tileRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  tileCol: {
    flex: 1,
  },
  lotsSection: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  sectionTitle: {
    marginBottom: spacing.xs,
  },
  lotList: {
    gap: spacing.sm,
  },
  lotCard: {
    padding: spacing.md,
  },
  lotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  lotIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lotInfo: {
    flex: 1,
    gap: 2,
  },
  lotTopLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
