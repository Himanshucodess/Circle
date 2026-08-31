import { apiFetch, getAuthToken } from "@/utils/api";
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
  images: { url: string; publicId?: string; uploadId?: string; displayOrder: number }[];
  attributes: Record<string, unknown>;
}

export interface UploadedImage {
  id: string;
  secureUrl: string;
  publicId: string;
}

export async function uploadImage(file: File, onProgress?: (percent: number) => void): Promise<UploadedImage> {
  const token = await getAuthToken();
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", "/api/uploads/images");
    request.withCredentials = true;
    if (token) request.setRequestHeader("Authorization", `Bearer ${token}`);
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100));
    };
    request.onload = () => {
      let body: any;
      try { body = JSON.parse(request.responseText); } catch { body = null; }
      if (request.status >= 200 && request.status < 300 && body?.data) return resolve(body.data);
      reject(new Error(body?.error?.message || "Photo upload failed."));
    };
    request.onerror = () => reject(new Error("Photo upload failed."));
    const form = new FormData();
    form.append("image", file);
    request.send(form);
  });
}

export async function deleteUploadedImage(id: string) {
  return apiFetch<{ removed: boolean }>(`/api/uploads/images/${id}`, { method: "DELETE" });
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

export async function deleteListing(id: string) {
  return apiFetch<{ removed: boolean }>(`/api/listings/${id}`, { method: "DELETE" });
}
