// Serves: R16
import { Platform } from 'react-native';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import { Lot } from '../domain/types';
import { LedgerEntry } from '../store/useLedgerStore';

export function lotsToCSV(lots: Lot[]): string {
  const headers = [
    'Reference',
    'Status',
    'Date',
    'Materials',
    'DeclaredQty',
    'FinalPrice',
    'BuyerId',
  ];

  const rows = lots.map((l) => [
    l.ref,
    l.status,
    l.collectedAt,
    l.items.map((i) => i.materialId).join(';'),
    l.items.reduce((sum, i) => sum + i.qty, 0),
    l.finalPrice || l.quoted || 0,
    l.recyclerId || '',
  ]);

  return [headers.join(','), ...rows.map((r) => r.map((cell) => `"${cell}"`).join(','))].join(
    '\n',
  );
}

export function ledgerToCSV(entries: LedgerEntry[]): string {
  const headers = ['Reference', 'Date', 'Amount', 'Status', 'Method', 'Buyer', 'Materials'];

  const rows = entries.map((e) => [
    e.ref,
    e.at,
    e.amount,
    e.status,
    e.method,
    e.buyerName,
    e.materials.join(';'),
  ]);

  return [headers.join(','), ...rows.map((r) => r.map((cell) => `"${cell}"`).join(','))].join(
    '\n',
  );
}

export async function exportDataAsFiles(
  lots: Lot[],
  ledger: LedgerEntry[],
): Promise<{ success: boolean; error?: string }> {
  try {
    const payload = {
      exportedAt: new Date().toISOString(),
      app: 'Kabadiwala Connect',
      version: '1.0.0',
      lots,
      ledger,
    };

    const jsonString = JSON.stringify(payload, null, 2);

    if (Platform.OS === 'web') {
      // Trigger browser download for JSON
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kabadiwala_data_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      return { success: true };
    }

    // Native: write to documents directory and share
    const exportFile = new File(Paths.document, 'kabadiwala_export.json');
    exportFile.write(jsonString);

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(exportFile.uri, {
        mimeType: 'application/json',
        dialogTitle: 'Export Kabadiwala Connect Data',
      });
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}
