import { apiFetch } from "@/utils/api";
import { CategorySchema } from "@marketplace/shared";

export async function getSellerSchema(categoryIdOrSlug: string): Promise<CategorySchema> {
  return apiFetch<CategorySchema>(`/api/categories/${categoryIdOrSlug}/schema`);
}
