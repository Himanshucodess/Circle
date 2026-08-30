import { apiFetch } from "@/utils/api";
import { CategoryDto } from "@marketplace/shared";

export async function fetchCategories(): Promise<CategoryDto[]> {
  return apiFetch<CategoryDto[]>("/api/categories");
}

export async function getCategory(id: string): Promise<CategoryDto> {
  return apiFetch<CategoryDto>(`/api/categories/${id}`);
}

export interface CategoryFieldWithField {
  id: string;
  categoryId: string;
  fieldId: string;
  displayOrder: number;
  isRequired: boolean;
  conditionalRule: any;
  field: any;
}

export async function fetchCategoryFields(
  categoryId: string
): Promise<CategoryFieldWithField[]> {
  return apiFetch<CategoryFieldWithField[]>(`/api/admin/categories/${categoryId}/fields`);
}

export async function attachFieldToCategory(
  categoryId: string,
  body: { fieldId: string; isRequired?: boolean; conditionalRule?: any }
) {
  return apiFetch<any>(`/api/admin/categories/${categoryId}/fields`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateCategoryField(
  categoryId: string,
  fieldId: string,
  body: { isRequired?: boolean; displayOrder?: number; conditionalRule?: any }
) {
  return apiFetch<any>(`/api/admin/categories/${categoryId}/fields/${fieldId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function removeCategoryField(categoryId: string, fieldId: string) {
  return apiFetch<any>(`/api/admin/categories/${categoryId}/fields/${fieldId}`, {
    method: "DELETE",
  });
}

export async function reorderCategoryFields(categoryId: string, fieldIds: string[]) {
  return apiFetch<any>(`/api/admin/categories/${categoryId}/fields/reorder`, {
    method: "POST",
    body: JSON.stringify({ fieldIds }),
  });
}
