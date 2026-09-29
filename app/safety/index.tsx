// Serves: R10, R11
import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { WarningCircle } from 'phosphor-react-native';

import { ScreenShell } from '../../src/ui/ScreenShell';
import { TopBar } from '../../src/ui/TopBar';
import { Text } from '../../src/ui/Text';
import { Card } from '../../src/ui/Card';
import { ListenButton } from '../../src/ui/ListenButton';
import { getSafetyPictogram, SafetyPictogramId } from '../../src/pictograms/safety';
import { tokens } from '../../src/theme/tokens';
import { useT } from '../../src/i18n';

interface SafetyCardItem {
  id: SafetyPictogramId;
  titleEn: string;
  titleHi: string;
  titleMr: string;
  descEn: string;
  descHi: string;
  descMr: string;
  badge: 'danger' | 'warning' | 'info';
}

const SAFETY_CARDS: SafetyCardItem[] = [
  {
    id: 'no_burn',
    titleEn: 'Do Not Burn Wires or Plastics',
    titleHi: 'तार या प्लास्टिक मत जलाएं',
    titleMr: 'वायर किंवा प्लास्टिक जाळू नका',
    descEn:
      'Burning wire insulation releases cancer-causing toxic dioxins and causes severe lung damage. Strip copper mechanically or sell whole to an authorised recycler.',
    descHi:
      'तार जलाने से जहरीला धुआं निकलता है जो फेफड़ों को भारी नुकसान पहुंचाता है। तारों को बिना जलाए अधिकृत रिसाइकलर को सीधे बेचें।',
    descMr:
      'वायर जाळल्याने विषारी धूर निघतो ज्यामुळे फुप्फुसांचे गंभीर आजार होतात. तांबे न जाळता थेट अधिकृत रिसायकलरला विका.',
    badge: 'danger',
  },
  {
    id: 'no_break_crt',
    titleEn: 'Do Not Break CRT Screens',
    titleHi: 'टीवी की स्क्रीन मत फोड़ें',
    titleMr: 'टीव्हीची काच फोडू नका',
    descEn:
      'Old TV tubes contain dangerous vacuum implosion hazards and hazardous toxic lead powder. Never smash the funnel glass; sell intact.',
    descHi:
      'पुराने टीवी ट्यूब में लेड और जहरीला पाउडर होता है। शीशा फोड़ने से वैक्यूम फटने का खतरा रहता है। स्क्रीन को हमेशा साबुत रखें।',
    descMr:
      'जुन्या टीव्हीच्या काचेत विषारी शिसे (Lead) असते. काच फोडल्याने स्फोट होऊ शकतो. काच न फोडता पूर्ण टीव्ही विका.',
    badge: 'danger',
  },
  {
    id: 'battery_care',
    titleEn: 'Handle Batteries With Care',
    titleHi: 'बैटरी को सावधानी से रखें',
    titleMr: 'बॅटरी सावधगिरीने हाताळा',
    descEn:
      'Punctured or heated lithium-ion and lead-acid batteries can explode or catch fire. Store them upright in dry, covered shade.',
    descHi:
      'बैटरी पर चोट लगने या गर्मी से आग लग सकती है। एसिड लीकेज से त्वचा जल सकती है। बैटरी को हमेशा सूखी और छायादार जगह पर रखें।',
    descMr:
      'बॅटरी फुटल्यास आग किंवा आम्ल (Acid) गळती होऊ शकते. बॅटऱ्या उन्हात न ठेवता कोरड्या सावलीच्या ठिकाणी ठेवा.',
    badge: 'warning',
  },
  {
    id: 'no_acid',
    titleEn: 'No Backyard Acid Washing',
    titleHi: 'एसिड वॉश बिल्कुल न करें',
    titleMr: 'अ‍ॅसिड वॉश करू नका',
    descEn:
      'Extracting gold with nitric acid or cyanide poisons groundwater and causes permanent skin burns. Formal recyclers use closed safe processes.',
    descHi:
      'सोना निकालने के लिए एसिड का उपयोग भूजल को दूषित करता है और जानलेवा होता है। अधिकृत रिसाइक्लिंग केंद्रों में सुरक्षित मशीनें होती हैं।',
    descMr:
      'सोने काढण्यासाठी अ‍ॅसिड वापरल्याने भूजल विषारी होते आणि त्वचा जळते. अधिकृत कारखान्यात सुरक्षित तंत्रज्ञान वापरले जाते.',
    badge: 'danger',
  },
  {
    id: 'no_desolder',
    titleEn: 'Avoid Gas Stove Desoldering',
    titleHi: 'गैस चूल्हे पर टांका मत निकालें',
    titleMr: 'गॅस शेगडीवर वितळवू नका',
    descEn:
      'Heating circuit boards over home stoves releases lead and tin vapor into living spaces. Keep electronic boards intact.',
    descHi:
      'सर्किट बोर्ड को घर के चूल्हे पर गर्म करने से सीसा (Lead) का धुआं फैलता है। बोर्ड को साबुत अधिकृत खरीदार को दें।',
    descMr:
      'घरातील चुलीवर किंवा शेगडीवर सर्किट बोर्ड गरम केल्याने विषारी धूर हवेत पसरतो. बोर्ड न तोडता थेट विका.',
    badge: 'warning',
  },
  {
    id: 'gloves_mask',
    titleEn: 'Always Wear Gloves and Mask',
    titleHi: 'दस्ताने और मास्क जरूर पहनें',
    titleMr: 'हातमोजे व मास्क नक्की वापरा',
    descEn:
      'Protect your hands from sharp sheet metal, broken capacitors, and heavy metal dust when sorting and loading scrap lots.',
    descHi:
      'स्क्रैप छांटते समय हाथों को कटने और जहरीली धूल से बचाने के लिए हमेशा मोटे दस्ताने और मास्क का इस्तेमाल करें।',
    descMr:
      'कचरा गोळा करताना व वेगळा करताना धारदार पत्रा आणि विषारी धुळीपासून संरक्षणासाठी जाड हातमोजे आणि मास्क वापरा.',
    badge: 'info',
  },
];

export default function SafetyScreen() {
  const { t, lang } = useT();

  const getTitle = (item: SafetyCardItem) => {
    if (lang === 'mr') return item.titleMr;
    if (lang === 'hi') return item.titleHi;
    return item.titleEn;
  };

  const getDesc = (item: SafetyCardItem) => {
    if (lang === 'mr') return item.descMr;
    if (lang === 'hi') return item.descHi;
    return item.descEn;
  };

  return (
    <ScreenShell>
      <TopBar
        title={t('safety')}
        showBack
        onBack={() => router.push('/home')}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Subtitle Banner */}
        <View style={styles.introStrip}>
          <WarningCircle size={24} color={tokens.warning} weight="bold" />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text variant="heading" weight="700" color={tokens.ink}>
              Work Safe, Earn Fair
            </Text>
            <Text variant="caption" color={tokens.inkMuted}>
              Protect your health and environment. Tap the listen button on any card for spoken guidance.
            </Text>
          </View>
        </View>

        {/* 6 Pictorial Cards */}
        {SAFETY_CARDS.map((card) => {
          const title = getTitle(card);
          const desc = getDesc(card);
          const speakText = `${title}. ${desc}`;

          const badgeColor =
            card.badge === 'danger'
              ? tokens.danger
              : card.badge === 'warning'
              ? tokens.warning
              : tokens.primary;

          return (
            <Card key={card.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.pictogramBox}>
                  {getSafetyPictogram(card.id, 52)}
                </View>

                <View style={styles.cardTextCol}>
                  <View style={styles.titleRow}>
                    <Text variant="body" weight="700" color={tokens.ink} style={{ flex: 1 }}>
                      {title}
                    </Text>
                    <ListenButton textToSpeak={speakText} lang={lang} size={32} />
                  </View>

                  <Text variant="caption" color={tokens.inkMuted} style={styles.descText}>
                    {desc}
                  </Text>
                </View>
              </View>

              <View style={[styles.badgeStrip, { backgroundColor: badgeColor + '15' }]}>
                <Text variant="caption" weight="700" color={badgeColor}>
                  {card.badge === 'danger' ? 'HAZARDOUS · धोकेदायक' : 'SAFETY RULE · सुरक्षा नियम'}
                </Text>
              </View>
            </Card>
          );
        })}
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  introStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.surface,
    borderWidth: 1,
    borderColor: tokens.outline,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  card: {
    marginBottom: 14,
    backgroundColor: tokens.surface,
    padding: 14,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  pictogramBox: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardTextCol: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  descText: {
    lineHeight: 18,
  },
  badgeStrip: {
    marginTop: 10,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
});
