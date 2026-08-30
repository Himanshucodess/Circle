import { apiFetch } from "@/utils/api";
import { ListingDto } from "@marketplace/shared";

export async function fetchListings(limit?: number, options?: { search?: string; category?: string }): Promise<ListingDto[]> {
  const params = new URLSearchParams();
  if (limit) params.set("limit", String(limit));
  if (options?.search) params.set("search", options.search);
  if (options?.category) params.set("category", options.category);
  const q = params.toString() ? `?${params.toString()}` : "";
  return apiFetch<ListingDto[]>(`/api/listings${q}`);
}

export async function getListing(id: string): Promise<
  ListingDto & { schema?: { fields: any[] } }
> {
  return apiFetch<any>(`/api/listings/${id}`);
}

export interface CreateListingInput {
  categoryId: string;
  title: string;
  description: string;
  price: number;
  condition: string;
  location: string;
  images: { url: string; displayOrder: number }[];
  attributes: Record<string, unknown>;
}

export async function createListing(input: CreateListingInput): Promise<ListingDto> {
  return apiFetch<ListingDto>("/api/listings", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function recordListingView(id: string) {
  return apiFetch<{ viewCount: number }>(`/api/listings/${id}/view`, { method: "POST" });
}

export async function fetchMyListings() {
  return apiFetch<ListingDto[]>("/api/listings/mine");
}
