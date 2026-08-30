import * as repo from "../repositories/categoryRequestRepository";
import * as categoryRepo from "../repositories/categoryRepository";
import { ApiError } from "../utils/ApiError";

export function normalizeSlug(value: string) {
  const slug = value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return slug.length > 3 && slug.endsWith("s") ? slug.slice(0, -1) : slug;
}

export async function createRequest(body: any, userId: string) {
  const name = String(body?.name || "").trim();
  const description = String(body?.description || "").trim();
  const reason = String(body?.reason || "").trim();
  if (name.length < 2 || description.length < 10 || reason.length < 10) {
    throw ApiError.badRequest("VALIDATION_ERROR", "Please provide a category name, description, and reason.");
  }
  const slug = normalizeSlug(name);
  const existing = await categoryRepo.findBySlug(slug);
  const requested = await repo.findDuplicate(slug);
  if (existing || requested) throw ApiError.conflict("DUPLICATE_CATEGORY", "A similar category already exists.");
  return repo.create({ requestedBy: userId, name, slug, description, reason, exampleProducts: body.exampleProducts ? String(body.exampleProducts).trim() : null });
}

export const listMine = repo.listMine;
export const listAll = repo.listAll;

export async function reviewRequest(id: string, status: string, adminNote: string | undefined, adminId: string) {
  if (!["APPROVED", "REJECTED"].includes(status)) throw ApiError.badRequest("VALIDATION_ERROR", "Invalid request status");
  const request = await repo.findById(id);
  if (!request) throw ApiError.notFound("Category request not found");
  if (request.status !== "PENDING") throw ApiError.badRequest("REQUEST_REVIEWED", "This request has already been reviewed");
  if (status === "REJECTED") return repo.update(id, { status, adminNote: adminNote?.trim() || null, reviewedBy: adminId, reviewedAt: new Date() });
  const existing = await categoryRepo.findBySlug(request.slug);
  if (existing) throw ApiError.conflict("DUPLICATE_CATEGORY", "A similar category already exists.");
  await categoryRepo.create({ name: request.name, slug: request.slug, description: request.description });
  return repo.update(id, { status, adminNote: adminNote?.trim() || null, reviewedBy: adminId, reviewedAt: new Date() });
}
