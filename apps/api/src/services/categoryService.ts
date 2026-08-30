import * as categoryRepo from "../repositories/categoryRepository";
import { ApiError } from "../utils/ApiError";

export async function getCategories() {
  return categoryRepo.listActive();
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
  return categoryRepo.create(input);
}

export async function updateCategory(id: string, input: any) {
  const existing = await categoryRepo.findById(id);
  if (!existing) throw ApiError.notFound("Category not found");
  return categoryRepo.update(id, input);
}

export async function archiveCategory(id: string) {
  const existing = await categoryRepo.findById(id);
  if (!existing) throw ApiError.notFound("Category not found");
  return categoryRepo.archive(id);
}

export async function getDashboardStats() {
  const [categories, activeCategories, fields, listings] = await Promise.all([
    categoryRepo.countAll(),
    categoryRepo.countActive(),
    (await import("../repositories/fieldRepository")).countAll(),
    (await import("../repositories/listingRepository")).countAll(),
  ]);
  return { categories, activeCategories, fields, listings };
}
