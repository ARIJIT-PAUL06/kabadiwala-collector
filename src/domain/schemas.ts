// Serves: R03, R16
import { z } from 'zod';

export const MaterialIdSchema = z.enum([
  'crt',
  'lcd',
  'pcb',
  'cable',
  'battery',
  'motor',
  'magnet',
  'plastic',
  'other',
]);

export const UnitSchema = z.enum(['kg', 'piece']);
export const ConditionSchema = z.enum(['whole', 'partly_opened', 'damaged']);
export const LangSchema = z.enum(['mr', 'hi', 'en']);

export const MaterialSchema = z.object({
  id: MaterialIdSchema,
  unit: UnitSchema,
  subCategories: z.array(z.string()),
  hazardous: z.boolean(),
});

export const PriceRecordSchema = z.object({
  id: z.string(),
  materialId: MaterialIdSchema,
  subCategory: z.string().optional(),
  district: z.string(),
  locality: z.string().optional(),
  date: z.string(),
  buyLow: z.number().nonnegative(),
  buyHigh: z.number().nonnegative(),
  recyclerOffer: z.number().nonnegative().optional(),
  recyclerId: z.string().optional(),
  unit: UnitSchema,
  source: z.enum(['SYNTHETIC', 'FIELD_SURVEY', 'RECYCLER', 'TRANSACTION']),
});

export const RecyclerSchema = z.object({
  id: z.string(),
  name: z.string(),
  kind: z.enum(['recycler', 'dismantler', 'aggregator_hub']),
  district: z.string(),
  locality: z.string(),
  lat: z.number(),
  lng: z.number(),
  accepts: z.array(MaterialIdSchema),
  authorisation: z.object({
    number: z.string(),
    issuer: z.string(),
    status: z.enum(['VALID', 'EXPIRED', 'SUSPENDED', 'UNVERIFIED']),
    validUntil: z.string(),
  }),
  phoneMasked: z.string(),
  offers: z.record(MaterialIdSchema, z.number().nonnegative()),
  pickup: z.object({
    available: z.boolean(),
    days: z.array(z.number()),
    minKg: z.number().nonnegative(),
  }),
  serviceRadiusKm: z.number().positive(),
  reliability: z.number().min(0).max(1),
  publicKeyHex: z.string(),
  demo: z.literal(true),
});

export const LotItemSchema = z.object({
  id: z.string(),
  materialId: MaterialIdSchema,
  subCategory: z.string().optional(),
  qty: z.number().nonnegative(),
  qtyRange: z.tuple([z.number(), z.number()]).optional(),
  unit: UnitSchema,
  condition: ConditionSchema,
});

export const LotStatusSchema = z.enum([
  'DRAFT',
  'VALUED',
  'OFFERED',
  'ACCEPTED',
  'HANDED_OVER',
  'CONFIRMED',
  'PAID',
  'PAYMENT_PENDING',
  'CANCELLED',
]);

export const GeoPointSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  accuracyM: z.number().optional(),
});

export const HandoverRecordSchema = z.object({
  ref: z.string(),
  lotId: z.string(),
  recyclerId: z.string(),
  photos: z.array(z.string()),
  declaredQty: z.number().nonnegative(),
  unit: UnitSchema,
  at: z.string(),
  location: GeoPointSchema.optional(),
  prevHash: z.string(),
  recordHash: z.string(),
  code6: z.string(),
  confirmation: z
    .object({
      measuredQty: z.number().nonnegative(),
      finalPrice: z.number().nonnegative(),
      confirmedAt: z.string(),
      signatureHex: z.string(),
    })
    .optional(),
});

export const PaymentSchema = z.object({
  method: z.enum(['cash', 'upi', 'pending']),
  amount: z.number().nonnegative(),
  at: z.string().optional(),
  upiRefLast4: z.string().optional(),
});

export const LotSchema = z.object({
  id: z.string(),
  ref: z.string(),
  collectorId: z.string(),
  items: z.array(LotItemSchema),
  photos: z.array(z.string()),
  description: z.string().optional(),
  estimate: z
    .object({
      low: z.number().nonnegative(),
      high: z.number().nonnegative(),
      basis: z.string(),
      computedAt: z.string(),
    })
    .optional(),
  recyclerId: z.string().optional(),
  quoted: z.number().nonnegative().optional(),
  counterAsked: z.number().nonnegative().optional(),
  finalPrice: z.number().nonnegative().optional(),
  measuredQty: z.number().nonnegative().optional(),
  collectedAt: z.string(),
  collectedLocation: GeoPointSchema.optional(),
  handover: HandoverRecordSchema.optional(),
  payment: PaymentSchema.optional(),
  status: LotStatusSchema,
  history: z.array(
    z.object({
      at: z.string(),
      status: LotStatusSchema,
      note: z.string().optional(),
    }),
  ),
  anomaly: z.enum(['LOW', 'HIGH']).optional(),
  updatedAt: z.string(),
  syncedAt: z.string().optional(),
});

export const CollectorProfileSchema = z.object({
  id: z.string(),
  lang: LangSchema,
  district: z.string(),
  locality: z.string(),
  phoneHash: z.string().optional(),
  role: z.enum(['collector', 'aggregator']),
  createdAt: z.string(),
});

export const OutboxOpSchema = z.object({
  id: z.string(),
  kind: z.enum(['UPSERT_LOT', 'HANDOVER', 'PAYMENT']),
  payload: z.unknown(),
  createdAt: z.string(),
  attempts: z.number().nonnegative(),
  lastError: z.string().optional(),
});

/**
 * Safe parse array helper: validates items with Zod schema.
 * Invalid records are dropped and logged without crashing the application.
 */
export function safeParseArray<T>(
  schema: z.ZodType<T>,
  data: unknown,
  recordTypeName = 'record',
): T[] {
  if (!Array.isArray(data)) {
    return [];
  }
  const validItems: T[] = [];
  data.forEach((item, idx) => {
    const result = schema.safeParse(item);
    if (result.success) {
      validItems.push(result.data);
    } else {
      console.warn(
        `[Zod Validation] Dropped corrupt ${recordTypeName} at index ${idx}:`,
        result.error.issues,
      );
    }
  });
  return validItems;
}
