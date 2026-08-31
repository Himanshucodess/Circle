import * as categoryRepo from "../repositories/categoryRepository";
import { ApiError } from "../utils/ApiError";
import { CACHE_TTL, cacheKeys } from "../infrastructure/cache/cacheKeys";
import { cacheService } from "../infrastructure/cache/cacheService";
import { invalidateCategoryCaches, invalidateListingCaches } from "../infrastructure/cache/cacheInvalidation";

export async function getCategories() {
  const key = cacheKeys.activeCategories();
  const cached = await cacheService.get<any[]>(key);
  if (cached) return cached;
  const categories = await categoryRepo.listActive();
  await cacheService.set(key, categories, CACHE_TTL.CATEGORY);
  return categories;
}

export async function getCategoriesAdmin() {
  return categoryRepo.listAll();
}

export async function getCategory(id: string) {
  const category = await categoryRepo.findActive(id);
  if (!category) throw ApiError.notFound("Category not found");
  return category;
}

export async function getCategoryAdmin(id: string) {
  const category = await categoryRepo.findById(id);
  if (!category) throw ApiError.notFound("Category not found");
  return category;
}

export async function createCategory(input: any) {
  const category = await categoryRepo.create(input);
  await invalidateCategoryCaches(category.id);
  return category;
}

export async function updateCategory(id: string, input: any) {
  const existing = await categoryRepo.findById(id);
  if (!existing) throw ApiError.notFound("Category not found");
  const category = await categoryRepo.update(id, input);
  await invalidateCategoryCaches(id);
  await invalidateListingCaches();
  return category;
}

export async function archiveCategory(id: string) {
  const existing = await categoryRepo.findById(id);
  if (!existing) throw ApiError.notFound("Category not found");
  const category = await categoryRepo.archive(id);
  await invalidateCategoryCaches(id);
  await invalidateListingCaches();
  return category;
}

export async function getDashboardStats() {
  const [categories, activeCategories, fields, listings, publishedSchemas, pendingRequests] = await Promise.all([
    categoryRepo.countAll(),
    categoryRepo.countActive(),
    (await import("../repositories/fieldRepository")).countAll(),
    (await import("../repositories/listingRepository")).countAll(),
    categoryRepo.countPublishedSchemas(),
    (await import("../lib/prisma")).default.categoryRequest.count({ where: { status: "PENDING" } }),
  ]);
  return { categories, activeCategories, fields, listings, publishedSchemas, pendingRequests };
}
