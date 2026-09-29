// Serves: R11, R13
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing } from '../../src/theme/tokens';
import { Text } from '../../src/ui/Text';
import { Button } from '../../src/ui/Button';
import { Card } from '../../src/ui/Card';
import { Tile } from '../../src/ui/Tile';
import { Chip } from '../../src/ui/Chip';
import { StatusChip } from '../../src/ui/StatusChip';
import { MoneyText } from '../../src/ui/MoneyText';
import { ListenButton } from '../../src/ui/ListenButton';
import { Stepper } from '../../src/ui/Stepper';
import { SyncDot } from '../../src/ui/SyncDot';
import { AuthorisedBadge } from '../../src/ui/AuthorisedBadge';
import { StepIndicator } from '../../src/ui/StepIndicator';
import { TrendArrow } from '../../src/ui/TrendArrow';
import { Sparkline } from '../../src/ui/Sparkline';
import { Banner } from '../../src/ui/Banner';
import { EmptyState } from '../../src/ui/EmptyState';
import { ScreenShell } from '../../src/ui/ScreenShell';
import { MaterialPictograms, MaterialPictogramId } from '../../src/pictograms';
import { SafetyPictograms, SafetyPictogramId } from '../../src/pictograms/safety';

export default function ComponentGalleryScreen() {
  const router = useRouter();
  const [stepperVal, setStepperVal] = useState(12.5);
  const [selectedChip, setSelectedChip] = useState('itwari');
  const [selectedTile, setSelectedTile] = useState('pcb');

  const materials: MaterialPictogramId[] = [
    'crt',
    'lcd',
    'pcb',
    'cable',
    'battery',
    'motor',
    'magnet',
    'plastic',
    'other',
  ];

  const safetyItems: SafetyPictogramId[] = [
    'no_burn',
    'no_break_crt',
    'battery_care',
    'no_acid',
    'no_desolder',
    'gloves_mask',
  ];

  return (
    <ScreenShell
      topBarProps={{
        title: 'Component Gallery',
        showBack: true,
        onBack: () => router.back(),
      }}
    >
      <View style={styles.section}>
        <Text variant="title" weight="700">
          UI Component Gallery (M1)
        </Text>
        <Text variant="bodySmall" color={colors.inkMuted}>
          Validated at 360 px width. Zero gradients, zero drop shadows.
        </Text>
      </View>

      {/* Typography */}
      <View style={styles.section}>
        <Text variant="heading" weight="700" color={colors.primary}>
          1. Typography Scale
        </Text>
        <Text variant="display">Display 36/44 Bold</Text>
        <Text variant="title">Title 24/32 Bold</Text>
        <Text variant="heading">Heading 20/28 Medium</Text>
        <Text variant="body">Body 18/26 Regular</Text>
        <Text variant="bodySmall">BodySmall 16/24 Regular</Text>
        <Text variant="label">Label 16/20 Medium</Text>
        <Text variant="caption">Caption 14/18 Regular</Text>
      </View>

      {/* Devanagari Typography */}
      <View style={styles.section}>
        <Text variant="heading" weight="700" color={colors.primary}>
          2. Devanagari (मराठी / हिंदी)
        </Text>
        <Text variant="title" lang="mr">
          कबाडीवाला कनेक्ट · नागपूर
        </Text>
        <Text variant="body" lang="hi">
          अपनी भाषा चुनें, सही भाव पाएं और अधिकृत खरीदार को बेचें।
        </Text>
      </View>

      {/* Material Pictograms */}
      <View style={styles.section}>
        <Text variant="heading" weight="700" color={colors.primary}>
          3. Material Pictograms (9)
        </Text>
        <View style={styles.grid3}>
          {materials.map((mat) => {
            const Comp = MaterialPictograms[mat];
            return (
              <View key={mat} style={styles.gridItem}>
                <Comp size={56} />
                <Text variant="caption" weight="500" style={styles.iconCaption}>
                  {mat.toUpperCase()}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Safety Pictograms */}
      <View style={styles.section}>
        <Text variant="heading" weight="700" color={colors.primary}>
          4. Safety Pictograms (6)
        </Text>
        <View style={styles.grid3}>
          {safetyItems.map((item) => {
            const Comp = SafetyPictograms[item];
            return (
              <View key={item} style={styles.gridItem}>
                <Comp size={56} />
                <Text variant="caption" weight="500" style={styles.iconCaption}>
                  {item.replace(/_/g, ' ')}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.section}>
        <Text variant="heading" weight="700" color={colors.primary}>
          5. Buttons
        </Text>
        <Button title="Primary Action" onPress={() => {}} variant="primary" />
        <Button title="Secondary Action" onPress={() => {}} variant="secondary" />
        <Button title="Outline Action" onPress={() => {}} variant="outline" />
        <Button title="Danger Action" onPress={() => {}} variant="danger" />
        <Button title="Text Action" onPress={() => {}} variant="text" />
        <Button title="Disabled Action" onPress={() => {}} disabled />
      </View>

      {/* Tiles */}
      <View style={styles.section}>
        <Text variant="heading" weight="700" color={colors.primary}>
          6. Interactive Tiles
        </Text>
        <View style={styles.grid2}>
          <Tile
            label="Sell"
            subLabel="Create lot"
            icon={<MaterialPictograms.pcb size={40} />}
            isPrimary={true}
            onPress={() => {}}
          />
          <Tile
            label="Rates"
            subLabel="Today's board"
            icon={<MaterialPictograms.cable size={40} />}
            selected={selectedTile === 'cable'}
            onPress={() => setSelectedTile('cable')}
          />
        </View>
      </View>

      {/* Chips */}
      <View style={styles.section}>
        <Text variant="heading" weight="700" color={colors.primary}>
          7. Chips, Badges & Audio/Sync
        </Text>
        <View style={styles.rowWrap}>
          <Chip
            label="Itwari"
            selected={selectedChip === 'itwari'}
            onPress={() => setSelectedChip('itwari')}
          />
          <Chip
            label="Gandhibagh"
            selected={selectedChip === 'gandhibagh'}
            onPress={() => setSelectedChip('gandhibagh')}
          />
          <Chip
            label="Kamptee Road"
            selected={selectedChip === 'kamptee'}
            onPress={() => setSelectedChip('kamptee')}
          />
        </View>
        <AuthorisedBadge
          authNumber="DEMO-MPCB-EW-0001"
          validUntil="31 Mar 2027"
        />
        <View style={styles.rowWrap}>
          <ListenButton textToSpeak="आजचे भाव" lang="mr" />
          <SyncDot state="synced" />
          <SyncDot state="pending" pendingCount={3} />
          <SyncDot state="offline" />
        </View>
      </View>

      {/* Status Chips */}
      <View style={styles.section}>
        <Text variant="heading" weight="700" color={colors.primary}>
          8. Lot Statuses
        </Text>
        <View style={styles.rowWrap}>
          <StatusChip status="DRAFT" />
          <StatusChip status="VALUED" />
          <StatusChip status="OFFERED" />
          <StatusChip status="ACCEPTED" />
          <StatusChip status="HANDED_OVER" />
          <StatusChip status="CONFIRMED" />
          <StatusChip status="PAID" />
          <StatusChip status="PAYMENT_PENDING" />
          <StatusChip status="CANCELLED" />
        </View>
      </View>

      {/* Money & Stepper */}
      <View style={styles.section}>
        <Text variant="heading" weight="700" color={colors.primary}>
          9. Money & Stepper
        </Text>
        <Card variant="moneyContainer">
          <Text variant="label" color={colors.money}>
            Estimated Fair Value Range:
          </Text>
          <MoneyText range={[1450, 2100]} variant="display" />
        </Card>
        <Stepper
          value={stepperVal}
          onChange={setStepperVal}
          step={0.5}
          largeStep={5}
          unit="kg"
        />
      </View>

      {/* Trends & Sparkline */}
      <View style={styles.section}>
        <Text variant="heading" weight="700" color={colors.primary}>
          10. Trends & Sparkline
        </Text>
        <View style={styles.rowWrap}>
          <TrendArrow direction="up" percentChange={6.2} showPercent />
          <TrendArrow direction="down" percentChange={4.1} showPercent />
          <TrendArrow direction="flat" />
        </View>
        <Sparkline
          data={[140, 145, 142, 155]}
          labels={['W1', 'W2', 'W3', 'W4']}
          width={300}
        />
      </View>

      {/* Step Indicator & Banners */}
      <View style={styles.section}>
        <Text variant="heading" weight="700" color={colors.primary}>
          11. Step Indicator & Banners
        </Text>
        <StepIndicator currentStep={2} totalSteps={5} />
        <Banner
          type="info"
          message="Offline — saved on phone. 2 changes pending."
          actionText="Send now"
          onAction={() => {}}
        />
        <Banner
          type="warning"
          message="Price unusually low — check before you agree."
        />
        <Banner
          type="danger"
          message="Hazard alert: Handle swelling batteries with care."
        />
      </View>

      {/* Empty State */}
      <View style={styles.section}>
        <Text variant="heading" weight="700" color={colors.primary}>
          12. Empty State
        </Text>
        <EmptyState
          icon={<MaterialPictograms.other size={48} />}
          title="No lots yet"
          description="Photograph your scrap to get an instant fair valuation."
          actionTitle="Sell scrap"
          onAction={() => {}}
        />
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  grid3: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '30%',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outline,
    borderRadius: 8,
    padding: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCaption: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
  grid2: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    alignItems: 'center',
  },
});
