import { apiFetch } from "@/utils/api";
import { CategoryDto } from "@marketplace/shared";

export async function adminLogin(username: string, password: string) {
  const response = await fetch("/api/admin/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ username, password }) });
  const body = await response.json();
  if (!response.ok) throw new Error(body?.error?.message || "Invalid username or password.");
  return body.data;
}
export async function adminLogout() { await fetch("/api/admin/auth/logout", { method: "POST", credentials: "include" }); }
export async function adminSession() {
  const response = await fetch("/api/admin/auth/me", { credentials: "include" });
  if (!response.ok) return null;
  const body = await response.json();
  return body.data;
}
export async function fetchCategoryRequests() { return apiFetch<any[]>("/api/category-requests/admin"); }
export async function reviewCategoryRequest(id: string, status: "APPROVED" | "REJECTED", adminNote?: string) { return apiFetch<any>(`/api/category-requests/admin/${id}`, { method: "PATCH", body: JSON.stringify({ status, adminNote }) }); }

export type CategoryFieldAdmin = {
  id: string;
  categoryId: string;
  fieldId: string;
  displayOrder: number;
  isRequired: boolean;
  conditionalRule: any;
  field: any;
};

export type FieldAdmin = {
  id: string;
  key: string;
  label: string;
  type: string;
  description?: string | null;
  config: any;
  usedBy: number;
};

export type SchemaVersionAdmin = {
  id: string;
  version: number;
  status: string;
  publishedAt: string | null;
  createdAt: string;
};

// Admin categories
export async function fetchAdminCategories(): Promise<CategoryDto[]> {
  return apiFetch<CategoryDto[]>("/api/admin/categories");
}

export async function fetchAdminCategory(id: string): Promise<CategoryDto> {
  return apiFetch<CategoryDto>(`/api/admin/categories/${id}`);
}

export async function fetchStats(): Promise<{
  categories: number;
  activeCategories: number;
  fields: number;
  listings: number;
  publishedSchemas: number;
  pendingRequests: number;
}> {
  return apiFetch<any>("/api/admin/categories/stats");
}

export async function createCategory(body: {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
}): Promise<CategoryDto> {
  return apiFetch<CategoryDto>("/api/admin/categories", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateCategory(
  id: string,
  body: Partial<{ name: string; slug: string; description: string; icon: string }>
): Promise<CategoryDto> {
  return apiFetch<CategoryDto>(`/api/admin/categories/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function archiveCategory(id: string): Promise<CategoryDto> {
  return apiFetch<CategoryDto>(`/api/admin/categories/${id}`, { method: "DELETE" });
}

// Category fields
export async function fetchAdminCategoryFields(categoryId: string): Promise<CategoryFieldAdmin[]> {
  return apiFetch<CategoryFieldAdmin[]>(`/api/admin/categories/${categoryId}/fields`);
}

export async function attachField(
  categoryId: string,
  fieldId: string,
  isRequired = false
): Promise<CategoryFieldAdmin> {
  return apiFetch<CategoryFieldAdmin>(`/api/admin/categories/${categoryId}/fields`, {
    method: "POST",
    body: JSON.stringify({ fieldId, isRequired }),
  });
}

export async function updateCategoryField(
  categoryId: string,
  fieldId: string,
  body: Partial<{ isRequired: boolean; displayOrder: number; conditionalRule: any }>
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

// Schemas
export async function fetchSchemaVersions(categoryId: string): Promise<SchemaVersionAdmin[]> {
  return apiFetch<SchemaVersionAdmin[]>(`/api/admin/categories/${categoryId}/schemas`);
}

export async function publishCategory(categoryId: string) {
  return apiFetch<any>(`/api/admin/categories/${categoryId}/schema/publish`, { method: "POST" });
}

export async function saveCategoryDraft(categoryId: string) {
  return apiFetch<any>(`/api/admin/categories/${categoryId}/schema/draft`, { method: "POST" });
}

// Fields
export async function fetchFields(): Promise<FieldAdmin[]> {
  return apiFetch<FieldAdmin[]>("/api/admin/fields");
}

export async function fetchField(id: string): Promise<FieldAdmin> {
  return apiFetch<FieldAdmin>(`/api/admin/fields/${id}`);
}

export async function createField(body: any): Promise<FieldAdmin> {
  return apiFetch<FieldAdmin>("/api/admin/fields", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateField(id: string, body: any): Promise<FieldAdmin> {
  return apiFetch<FieldAdmin>(`/api/admin/fields/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

// Draft schema preview for admin
export async function fetchDraftSchema(categoryId: string): Promise<any> {
  return apiFetch<any>(`/api/admin/categories/${categoryId}/draft-schema`);
}
