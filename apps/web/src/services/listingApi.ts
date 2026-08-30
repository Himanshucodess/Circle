import { apiFetch } from "@/utils/api";
import { ListingDto } from "@marketplace/shared";

export async function fetchListings(limit?: number): Promise<ListingDto[]> {
  const q = limit ? `?limit=${limit}` : "";
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
