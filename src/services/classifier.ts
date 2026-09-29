// Serves: R01, R05
import { MaterialId } from '../domain/types';

export interface ClassifierResult {
  materialId: MaterialId;
  confidence: number;
}

export interface Classifier {
  suggest(photoUri: string): Promise<ClassifierResult | null>;
}

/**
 * Baseline NoopClassifier. Always returns null.
 * Future on-device or backend classifier can implement this interface.
 * S6 displays suggestion card only when confidence >= 0.7.
 */
export class NoopClassifier implements Classifier {
  async suggest(_photoUri: string): Promise<ClassifierResult | null> {
    return null;
  }
}

export const classifier: Classifier = new NoopClassifier();
