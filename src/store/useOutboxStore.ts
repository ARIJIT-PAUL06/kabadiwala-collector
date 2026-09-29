// Serves: R12, R16
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as Crypto from 'expo-crypto';
import { appStorage } from './storage';
import { OutboxOp } from '../domain/types';

export interface OutboxState {
  ops: OutboxOp[];

  enqueue: (kind: OutboxOp['kind'], payload: unknown) => string;
  dequeue: (id: string) => void;
  incrementAttempt: (id: string, lastError?: string) => void;
  getPendingOps: () => OutboxOp[];
  getPendingCount: () => number;
  clearOutbox: () => void;
}

export const useOutboxStore = create<OutboxState>()(
  persist(
    (set, get) => ({
      ops: [],

      enqueue: (kind, payload) => {
        const id = Crypto.randomUUID();
        const newOp: OutboxOp = {
          id,
          kind,
          payload,
          createdAt: new Date().toISOString(),
          attempts: 0,
        };
        set((state) => ({ ops: [...state.ops, newOp] }));
        return id;
      },

      dequeue: (id) => {
        set((state) => ({ ops: state.ops.filter((op) => op.id !== id) }));
      },

      incrementAttempt: (id, lastError) => {
        const now = new Date().toISOString();
        set((state) => ({
          ops: state.ops.map((op) =>
            op.id === id
              ? { ...op, attempts: op.attempts + 1, lastAttemptAt: now, lastError }
              : op,
          ),
        }));
      },

      getPendingOps: () => {
        return get().ops;
      },

      getPendingCount: () => {
        return get().ops.length;
      },

      clearOutbox: () => {
        set({ ops: [] });
      },
    }),
    {
      name: 'kabadiwala_outbox_store',
      version: 1,
      storage: createJSONStorage(() => appStorage),
    },
  ),
);
