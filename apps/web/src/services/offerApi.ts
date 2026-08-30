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
