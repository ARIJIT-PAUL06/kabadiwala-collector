// Serves: R09, R14, R16
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { appStorage } from './storage';

export interface LedgerEntry {
  id: string;
  lotId: string;
  ref: string;
  at: string;
  amount: number;
  method: 'cash' | 'upi' | 'pending';
  status: 'paid' | 'pending';
  buyerName: string;
  materials: string[];
  upiRefLast4?: string;
}

export interface LedgerState {
  entries: LedgerEntry[];

  addEntry: (entry: LedgerEntry) => void;
  markAsPaid: (lotId: string) => void;
  getThisWeekEarned: () => number;
  getThisMonthEarned: () => number;
  getPendingDues: () => number;
  getPendingCount: () => number;
  resetLedger: () => void;
}

export const useLedgerStore = create<LedgerState>()(
  persist(
    (set, get) => ({
      entries: [
        // 2 synthetic historical entries for Nagpur demo to demonstrate the money strip & ledger
        {
          id: 'led_demo_1',
          lotId: 'demo_lot_1',
          ref: 'KC-260920-8A11',
          at: '2026-09-20T10:30:00Z',
          amount: 1450,
          method: 'cash',
          status: 'paid',
          buyerName: 'GreenCycle Recyclers (demo)',
          materials: ['pcb', 'cable'],
        },
        {
          id: 'led_demo_2',
          lotId: 'demo_lot_2',
          ref: 'KC-260925-9B22',
          at: '2026-09-25T14:15:00Z',
          amount: 820,
          method: 'pending',
          status: 'pending',
          buyerName: 'Vidarbha E-Waste Works (demo)',
          materials: ['motor', 'battery'],
        },
        {
          id: 'led_demo_3',
          lotId: 'demo_lot_3',
          ref: 'KC-260927-4C33',
          at: '2026-09-27T16:00:00Z',
          amount: 420,
          method: 'pending',
          status: 'pending',
          buyerName: 'Itwari Aggregator Hub (demo)',
          materials: ['plastic'],
        },
      ],

      addEntry: (entry) => {
        set((state) => {
          const index = state.entries.findIndex((e) => e.lotId === entry.lotId);
          if (index >= 0) {
            const next = [...state.entries];
            next[index] = entry;
            return { entries: next };
          }
          return { entries: [entry, ...state.entries] };
        });
      },

      markAsPaid: (lotId) => {
        set((state) => ({
          entries: state.entries.map((e) =>
            e.lotId === lotId ? { ...e, status: 'paid', method: 'cash' } : e,
          ),
        }));
      },

      getThisWeekEarned: () => {
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 86400000);
        return get()
          .entries.filter((e) => e.status === 'paid' && new Date(e.at) >= oneWeekAgo)
          .reduce((sum, e) => sum + e.amount, 0);
      },

      getThisMonthEarned: () => {
        const now = new Date();
        const oneMonthAgo = new Date(now.getTime() - 30 * 86400000);
        return get()
          .entries.filter((e) => e.status === 'paid' && new Date(e.at) >= oneMonthAgo)
          .reduce((sum, e) => sum + e.amount, 0);
      },

      getPendingDues: () => {
        return get()
          .entries.filter((e) => e.status === 'pending')
          .reduce((sum, e) => sum + e.amount, 0);
      },

      getPendingCount: () => {
        return get().entries.filter((e) => e.status === 'pending').length;
      },

      resetLedger: () => {
        set({ entries: [] });
      },
    }),
    {
      name: 'kabadiwala_ledger_store',
      version: 1,
      storage: createJSONStorage(() => appStorage),
    },
  ),
);
