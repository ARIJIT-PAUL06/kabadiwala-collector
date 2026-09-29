// Serves: R15, R16
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Lot } from '../domain/types';
import { LedgerEntry } from '../store/useLedgerStore';

export function generateLotsCsv(lots: Lot[]): string {
  const headers = ['Ref', 'CollectedAt', 'Status', 'Materials', 'TotalQty', 'Quoted', 'FinalPrice', 'BuyerId'];
  const rows = lots.map((lot) => {
    const materials = lot.items.map((i) => i.materialId).join(';');
    const totalQty = lot.items.reduce((sum, i) => sum + i.qty, 0);
    return [
      lot.ref,
      lot.collectedAt,
      lot.status,
      `"${materials}"`,
      totalQty,
      lot.quoted ?? '',
      lot.finalPrice ?? '',
      lot.recyclerId ?? '',
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

export function generateLedgerCsv(entries: LedgerEntry[]): string {
  const headers = ['Ref', 'BuyerName', 'Amount', 'Method', 'UpiRefLast4', 'Date', 'Status'];
  const rows = entries.map((tx) => {
    return [
      tx.ref,
      `"${tx.buyerName}"`,
      tx.amount,
      tx.method,
      tx.upiRefLast4 ?? '',
      tx.at,
      tx.status,
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

export async function exportLocalData(
  lots: Lot[],
  entries: LedgerEntry[],
  format: 'json' | 'csv',
): Promise<boolean> {
  const nowStr = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `kabadiwala_export_${nowStr}.${format}`;

  let content = '';
  let mimeType = 'text/plain';

  if (format === 'json') {
    mimeType = 'application/json';
    content = JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
        lots,
        entries,
      },
      null,
      2,
    );
  } else {
    mimeType = 'text/csv';
    const lotsCsv = generateLotsCsv(lots);
    const ledgerCsv = generateLedgerCsv(entries);
    content = `=== LOTS ===\n${lotsCsv}\n\n=== LEDGER ENTRIES ===\n${ledgerCsv}`;
  }

  // Web download handling
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  }

  // Native share sheet handling
  try {
    const fileUri = `${FileSystem.cacheDirectory || FileSystem.documentDirectory || ''}${filename}`;
    await FileSystem.writeAsStringAsync(fileUri, content, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(fileUri, {
        mimeType,
        dialogTitle: 'Export Kabadiwala Data',
      });
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
