import * as listingRepo from "../repositories/listingRepository";

export type PricingRating = "EXCELLENT" | "GOOD" | "COMPETITIVE" | "HIGH" | "TOO_HIGH" | "NO_DATA";

export interface PricingInsight {
  listingPrice: number;
  medianPrice: number | null;
  comparableCount: number;
  differencePercent: number | null;
  rating: PricingRating;
  message: string;
  range?: { min: number; max: number };
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

export async function getPricingInsight(listingPrice: number, categoryId: string, excludeId?: string): Promise<PricingInsight> {
  const comparable = await listingRepo.findComparableByCategory(categoryId, excludeId);
  const prices = comparable.map((l) => l.price).filter((p) => typeof p === "number" && p > 0);

  if (prices.length < 2) {
    return {
      listingPrice,
      medianPrice: null,
      comparableCount: prices.length,
      differencePercent: null,
      rating: "NO_DATA",
      message: "Not enough comparable listings to assess price.",
    };
  }

  const med = median(prices)!;
  const diff = ((listingPrice - med) / med) * 100;
  const min = Math.min(...prices);
  const max = Math.max(...prices);

  let rating: PricingRating;
  let message: string;

  if (diff <= -15) {
    rating = "EXCELLENT";
    message = `Excellent price — ${Math.abs(diff).toFixed(0)}% below median (₹${Math.round(med).toLocaleString()}). Likely to sell fast.`;
  } else if (diff <= -5) {
    rating = "GOOD";
    message = `Good price — ${Math.abs(diff).toFixed(0)}% below median (₹${Math.round(med).toLocaleString()}).`;
  } else if (diff <= 5) {
    rating = "COMPETITIVE";
    message = `Competitive — similar items are around ₹${Math.round(med).toLocaleString()}.`;
  } else if (diff <= 15) {
    rating = "HIGH";
    message = `High — ${diff.toFixed(0)}% above median (₹${Math.round(med).toLocaleString()}). Consider lowering.`;
  } else {
    rating = "TOO_HIGH";
    message = `Too high — ${diff.toFixed(0)}% above median (₹${Math.round(med).toLocaleString()}).`;
  }

  return {
    listingPrice,
    medianPrice: Math.round(med),
    comparableCount: prices.length,
    differencePercent: Number(diff.toFixed(2)),
    rating,
    message,
    range: { min, max },
  };
}
