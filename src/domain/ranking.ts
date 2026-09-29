// Serves: R04, R07
import { Recycler, LotItem, GeoPoint } from './types';
import { getConditionFactor } from './valuation';

export type RankingReasonCode =
  | 'BEST_RATE'
  | 'PICKUP_TODAY'
  | 'NEAREST'
  | 'TAKES_ALL'
  | 'RELIABLE';

export interface RankedRecycler {
  recycler: Recycler;
  score: number;
  totalOffer: number;
  distanceKm: number;
  acceptedMaterialsCount: number;
  fitRatio: number;
  reasons: RankingReasonCode[];
}

export function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

export function rankRecyclers(
  recyclers: Recycler[],
  items: LotItem[],
  collectorLocation: GeoPoint,
  referenceDate: Date = new Date(),
): RankedRecycler[] {
  if (items.length === 0 || recyclers.length === 0) return [];

  const todayStr = referenceDate.toISOString().split('T')[0];
  const lotMaterialIds = Array.from(new Set(items.map((i) => i.materialId)));

  // 1. Hard filter
  const candidates = recyclers.filter((rec) => {
    // Valid authorisation
    if (rec.authorisation.status !== 'VALID') return false;
    if (rec.authorisation.validUntil < todayStr) return false;

    // Accepts >= 1 material in lot
    const acceptsAny = lotMaterialIds.some((matId) => rec.accepts.includes(matId));
    if (!acceptsAny) return false;

    // Within service radius
    const dist = haversineDistanceKm(
      collectorLocation.lat,
      collectorLocation.lng,
      rec.lat,
      rec.lng,
    );
    if (dist > rec.serviceRadiusKm) return false;

    return true;
  });

  if (candidates.length === 0) return [];

  // Calculate raw metrics for each candidate
  interface CandidateMetrics {
    recycler: Recycler;
    distance: number;
    totalOffer: number;
    nearness: number;
    convenience: number;
    reliability: number;
    fit: number;
  }

  const rawList: CandidateMetrics[] = candidates.map((rec) => {
    const dist = haversineDistanceKm(
      collectorLocation.lat,
      collectorLocation.lng,
      rec.lat,
      rec.lng,
    );

    let totalOffer = 0;
    let acceptedCount = 0;

    items.forEach((item) => {
      const offerRate = rec.offers[item.materialId] || 0;
      if (offerRate > 0) {
        acceptedCount += 1;
        const qty = item.qtyRange ? (item.qtyRange[0] + item.qtyRange[1]) / 2 : item.qty;
        const factor = getConditionFactor(item.condition);
        totalOffer += offerRate * qty * factor;
      }
    });

    const fit = items.length > 0 ? acceptedCount / items.length : 0;
    const nearness = 1 - Math.min(dist / rec.serviceRadiusKm, 1);
    const convenience = (rec.pickup.available ? 0.6 : 0) + 0.4 * nearness;

    return {
      recycler: rec,
      distance: dist,
      totalOffer: Math.round(totalOffer / 10) * 10,
      nearness,
      convenience,
      reliability: rec.reliability,
      fit,
    };
  });

  // Calculate min and max for normalization
  const minOffer = Math.min(...rawList.map((m) => m.totalOffer));
  const maxOffer = Math.max(...rawList.map((m) => m.totalOffer));
  const minDist = Math.min(...rawList.map((m) => m.distance));
  const minConv = Math.min(...rawList.map((m) => m.convenience));
  const maxConv = Math.max(...rawList.map((m) => m.convenience));
  const minRel = Math.min(...rawList.map((m) => m.reliability));
  const maxRel = Math.max(...rawList.map((m) => m.reliability));
  const minFit = Math.min(...rawList.map((m) => m.fit));
  const maxFit = Math.max(...rawList.map((m) => m.fit));

  const ranked: RankedRecycler[] = rawList.map((m) => {
    const normPrice = maxOffer > minOffer ? (m.totalOffer - minOffer) / (maxOffer - minOffer) : 1;
    const normConv = maxConv > minConv ? (m.convenience - minConv) / (maxConv - minConv) : 1;
    const normRel = maxRel > minRel ? (m.reliability - minRel) / (maxRel - minRel) : 1;
    const normFit = maxFit > minFit ? (m.fit - minFit) / (maxFit - minFit) : 1;

    // Formula: 0.40 * price + 0.25 * convenience + 0.20 * reliability + 0.15 * fit
    const score = 0.4 * normPrice + 0.25 * normConv + 0.2 * normRel + 0.15 * normFit;

    // Reason codes (up to 2)
    const reasons: RankingReasonCode[] = [];
    if (m.totalOffer === maxOffer && m.totalOffer > 0) {
      reasons.push('BEST_RATE');
    }
    if (m.recycler.pickup.available) {
      reasons.push('PICKUP_TODAY');
    }
    if (m.distance === minDist && reasons.length < 2) {
      reasons.push('NEAREST');
    }
    if (m.fit === 1.0 && reasons.length < 2) {
      reasons.push('TAKES_ALL');
    }
    if (m.recycler.reliability >= 0.9 && reasons.length < 2) {
      reasons.push('RELIABLE');
    }

    return {
      recycler: m.recycler,
      score: Number(score.toFixed(3)),
      totalOffer: m.totalOffer,
      distanceKm: m.distance,
      acceptedMaterialsCount: Math.round(m.fit * items.length),
      fitRatio: m.fit,
      reasons: reasons.slice(0, 2),
    };
  });

  // Sort descending by score
  ranked.sort((a, b) => b.score - a.score);
  return ranked;
}
