import { apiFetch } from "@/utils/api";

export async function createOffer(listingId: string, body: { amount: number; message?: string }) {
  return apiFetch<any>(`/api/listings/${listingId}/offers`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function fetchOffers(listingId: string) {
  return apiFetch<any[]>(`/api/listings/${listingId}/offers`);
}

export async function getOfferCompetitiveness(listingId: string, amount: number) {
  return apiFetch<{ rating: string; message: string }>(`/api/listings/${listingId}/offer-competitiveness?amount=${encodeURIComponent(amount)}`);
}
