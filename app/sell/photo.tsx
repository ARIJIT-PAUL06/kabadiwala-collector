// Serves: R01, R08, R11, R15
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { Camera, Trash, Plus } from 'phosphor-react-native';

import { ScreenShell } from '../../src/ui/ScreenShell';
import { TopBar } from '../../src/ui/TopBar';
import { Text } from '../../src/ui/Text';
import { Button } from '../../src/ui/Button';
import { StepIndicator } from '../../src/ui/StepIndicator';
import { ListenButton } from '../../src/ui/ListenButton';
import { tokens } from '../../src/theme/tokens';
import { useT } from '../../src/i18n';
import { useLotStore } from '../../src/store/useLotStore';
import { useAppStore } from '../../src/store/useAppStore';
import { processPhoto } from '../../src/services/photos';

export default function SellPhotoScreen() {
  const { t, lang } = useT();
  const collectorId = useAppStore((s) => s.profile?.id || 'demo-collector');
  const { activeDraft, startDraft, updateDraft, saveDraft } = useLotStore();

  const [photos, setPhotos] = useState<string[]>(() => activeDraft?.photos || []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!activeDraft) {
      startDraft(collectorId);
    }
  }, [activeDraft, collectorId, startDraft]);

  const handleAddPhoto = async (fromCamera: boolean = true) => {
    if (photos.length >= 3) return;
    try {
      setLoading(true);
      let result: ImagePicker.ImagePickerResult;

      if (fromCamera && Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.7,
          });
        } else {
          result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.7,
          });
        }
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          quality: 0.7,
        });
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const rawUri = result.assets[0].uri;
        const processed = await processPhoto(rawUri);
        const updated = [...photos, processed.uri];
        setPhotos(updated);
        updateDraft({ photos: updated });
        saveDraft();
      }
    } catch (err) {
      console.warn('[Photo] Error taking photo:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUseDemoSample = async () => {
    // 1x1 base64 transparent pixel or SVG placeholder sample for web testing
    const sampleUri =
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23E4F0E9"/><text x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="20" fill="%231E6B45">SCRAP LOT SAMPLE</text></svg>';
    const processed = await processPhoto(sampleUri);
    const updated = [...photos, processed.uri];
    setPhotos(updated);
    updateDraft({ photos: updated });
    saveDraft();
  };

  const handleRemovePhoto = (index: number) => {
    const updated = photos.filter((_, idx) => idx !== index);
    setPhotos(updated);
    updateDraft({ photos: updated });
    saveDraft();
  };

  const handleNext = () => {
    if (photos.length === 0) return;
    saveDraft();
    router.push('/sell/category');
  };

  return (
    <ScreenShell>
      <TopBar title={t('sell')} onBack={() => router.back()} />

      <View style={styles.stepContainer}>
        <StepIndicator currentStep={1} totalSteps={5} lang={lang} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.guidanceBox}>
          <View style={styles.guidanceRow}>
            <View style={styles.guidanceTextWrap}>
              <Text variant="heading" style={styles.title}>
                {t('takePhoto')}
              </Text>
              <Text variant="body" color={tokens.inkMuted} style={styles.subtitle}>
                {t('photoGuidance')}
              </Text>
            </View>
            <ListenButton textToSpeak={`${t('takePhoto')}. ${t('photoGuidance')}`} lang={lang} />
          </View>
        </View>

        {/* Framing Guide Area */}
        <View style={styles.frameContainer}>
          <View style={styles.dashedFrame}>
            {photos.length === 0 ? (
              <View style={styles.framePlaceholder}>
                <Camera size={48} color={tokens.inkMuted} />
                <Text variant="bodySmall" color={tokens.inkMuted} style={styles.frameHint}>
                  {t('photoGuidance')}
                </Text>
              </View>
            ) : (
              <Image source={{ uri: photos[photos.length - 1] }} style={styles.previewImage} />
            )}
          </View>
        </View>

        {/* Thumbnail Strip */}
        <View style={styles.thumbnailRow}>
          {photos.map((uri, idx) => (
            <View key={idx} style={styles.thumbWrapper}>
              <Image source={{ uri }} style={styles.thumbnail} />
              <TouchableOpacity
                style={styles.deleteThumb}
                onPress={() => handleRemovePhoto(idx)}
                accessibilityLabel={t('retake')}
              >
                <Trash size={16} color={tokens.surface} />
              </TouchableOpacity>
            </View>
          ))}

          {photos.length < 3 && (
            <TouchableOpacity
              style={styles.addThumbButton}
              onPress={() => handleAddPhoto(true)}
              disabled={loading}
              accessibilityLabel={t('addPhoto')}
            >
              <Plus size={24} color={tokens.primary} />
              <Text variant="bodySmall" color={tokens.primary}>
                {photos.length}/3
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Camera action buttons */}
        <View style={styles.actionRow}>
          <Button
            title={t('takePhotoBtn')}
            variant="primary"
            onPress={() => handleAddPhoto(true)}
            disabled={photos.length >= 3 || loading}
          />
          {photos.length === 0 && (
            <TouchableOpacity onPress={handleUseDemoSample} style={styles.sampleButton}>
              <Text variant="label" color={tokens.inkMuted}>
                [Demo: use sample photo]
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={t('next')}
          variant="primary"
          onPress={handleNext}
          disabled={photos.length === 0}
        />
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  stepContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  guidanceBox: {
    marginBottom: 16,
  },
  guidanceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  guidanceTextWrap: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    marginBottom: 4,
  },
  subtitle: {
    lineHeight: 22,
  },
  frameContainer: {
    width: '100%',
    height: 220,
    marginBottom: 16,
  },
  dashedFrame: {
    flex: 1,
    borderWidth: 2,
    borderColor: tokens.outline,
    borderStyle: 'dashed',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: tokens.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  framePlaceholder: {
    alignItems: 'center',
    padding: 16,
  },
  frameHint: {
    marginTop: 8,
    textAlign: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  thumbWrapper: {
    width: 72,
    height: 72,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: tokens.outline,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  deleteThumb: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: tokens.danger,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addThumbButton: {
    width: 72,
    height: 72,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: tokens.primary,
    borderStyle: 'dashed',
    backgroundColor: tokens.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionRow: {
    gap: 12,
    marginTop: 8,
  },
  sampleButton: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: tokens.paper,
  },
});
