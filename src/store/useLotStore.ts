// Serves: R01, R03, R08, R16
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as Crypto from 'expo-crypto';
import { appStorage } from './storage';
import { Lot, LotStatus } from '../domain/types';
import { LotSchema, safeParseArray } from '../domain/schemas';
import { useOutboxStore } from './useOutboxStore';

export interface LotState {
  lots: Lot[];
  activeDraft: Lot | null;

  startDraft: (collectorId: string) => Lot;
  updateDraft: (partial: Partial<Lot>) => void;
  saveDraft: () => void;
  clearDraft: () => void;
  upsertLot: (lot: Lot, enqueueOutbox?: boolean) => void;
  updateLotStatus: (lotId: string, status: LotStatus, note?: string, enqueueOutbox?: boolean) => void;
  getLot: (id: string) => Lot | undefined;
  cancelLot: (id: string) => void;
  deleteLot: (id: string) => void;
  resetLots: () => void;
}

export function generateHumanRef(): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  let hexCode = 'A1B2';
  try {
    hexCode = Crypto.randomUUID().slice(0, 4).toUpperCase();
  } catch {
    hexCode = Math.floor(Math.random() * 0xffff)
      .toString(16)
      .padStart(4, '0')
      .toUpperCase();
  }
  return `KC-${yy}${mm}${dd}-${hexCode}`;
}

export const useLotStore = create<LotState>()(
  persist(
    (set, get) => ({
      lots: [],
      activeDraft: null,

      startDraft: (collectorId: string) => {
        const existing = get().activeDraft;
        if (existing) return existing;

        const newId = Crypto.randomUUID();
        const ref = generateHumanRef();
        const now = new Date().toISOString();

        const draft: Lot = {
          id: newId,
          ref,
          collectorId,
          items: [],
          photos: [],
          collectedAt: now,
          status: 'DRAFT',
          history: [{ at: now, status: 'DRAFT', note: 'Created lot' }],
          updatedAt: now,
        };

        set({ activeDraft: draft });
        return draft;
      },

      updateDraft: (partial) => {
        set((state) => {
          if (!state.activeDraft) return state;
          const updated: Lot = {
            ...state.activeDraft,
            ...partial,
            updatedAt: new Date().toISOString(),
          };
          return { activeDraft: updated };
        });
      },

      saveDraft: () => {
        const draft = get().activeDraft;
        if (!draft) return;
        get().upsertLot(draft);
      },

      clearDraft: () => {
        set({ activeDraft: null });
      },

      upsertLot: (lot, enqueueOutbox = true) => {
        set((state) => {
          const index = state.lots.findIndex((l) => l.id === lot.id);
          let nextLots: Lot[];
          if (index >= 0) {
            nextLots = [...state.lots];
            nextLots[index] = lot;
          } else {
            nextLots = [lot, ...state.lots];
          }
          return { lots: nextLots };
        });

        if (enqueueOutbox) {
          useOutboxStore.getState().enqueue('UPSERT_LOT', lot);
        }
      },

      updateLotStatus: (lotId, status, note, enqueueOutbox = true) => {
        set((state) => {
          const lot = state.lots.find((l) => l.id === lotId);
          if (!lot) return state;

          const now = new Date().toISOString();
          const nextHistory = [...lot.history, { at: now, status, note }];
          const updated: Lot = {
            ...lot,
            status,
            history: nextHistory,
            updatedAt: now,
          };

          if (enqueueOutbox) {
            useOutboxStore.getState().enqueue('UPDATE_LOT', updated);
          }

          return {
            lots: state.lots.map((l) => (l.id === lotId ? updated : l)),
          };
        });
      },

      getLot: (id) => {
        return get().lots.find((l) => l.id === id);
      },

      cancelLot: (id) => {
        get().updateLotStatus(id, 'CANCELLED', 'Cancelled by collector');
      },

      deleteLot: (id) => {
        set((state) => ({
          lots: state.lots.filter((l) => l.id !== id),
        }));
      },

      resetLots: () => {
        set({ lots: [], activeDraft: null });
      },
    }),
    {
      name: 'kabadiwala_lots_store',
      version: 1,
      storage: createJSONStorage(() => appStorage),
      migrate: (persistedState) => {
        const state = persistedState as { lots?: unknown[]; activeDraft?: unknown };
        if (state && Array.isArray(state.lots)) {
          // Drop corrupt records safely via Zod
          const validLots = safeParseArray(LotSchema, state.lots, 'Lot');
          return { ...state, lots: validLots };
        }
        return persistedState as LotState;
      },
    },
  ),
);
