import { apiFetch } from "@/utils/api";
export interface CategoryRequestInput { name: string; description: string; reason: string; exampleProducts?: string }
export function requestCategory(input: CategoryRequestInput) { return apiFetch<any>("/api/category-requests", { method: "POST", body: JSON.stringify(input) }); }
export function fetchMyCategoryRequests() { return apiFetch<any[]>("/api/category-requests/my"); }
