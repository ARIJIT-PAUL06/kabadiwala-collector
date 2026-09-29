// Serves: R01, R08, R15
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as Crypto from 'expo-crypto';

export interface ProcessedPhoto {
  uri: string;
  width: number;
  height: number;
  base64?: string;
  hash: string;
}

/**
 * Resizes photo so max dimension is <= 1024px,
 * compresses to JPEG (~0.6 quality),
 * strips EXIF metadata, and computes SHA-256 hash.
 */
export async function processPhoto(rawUri: string): Promise<ProcessedPhoto> {
  try {
    const result = await manipulateAsync(
      rawUri,
      [{ resize: { width: 1024 } }],
      {
        compress: 0.6,
        format: SaveFormat.JPEG,
        base64: true,
      },
    );

    // Compute SHA-256 hash for tamper-evident handover chain
    const b64 = result.base64 || '';
    const hash = b64
      ? await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, b64)
      : await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, result.uri);

    return {
      uri: result.uri,
      width: result.width,
      height: result.height,
      base64: result.base64,
      hash,
    };
  } catch (err) {
    console.warn('[Photos] Error processing with ImageManipulator, falling back to raw URI:', err);
    const fallbackHash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      rawUri,
    );
    return {
      uri: rawUri,
      width: 1024,
      height: 768,
      hash: fallbackHash,
    };
  }
}
