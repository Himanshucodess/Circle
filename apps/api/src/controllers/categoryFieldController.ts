import { Request, Response } from "express";
import * as categoryFieldRepo from "../repositories/categoryFieldRepository";
import * as categoryRepo from "../repositories/categoryRepository";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import {
  attachFieldSchema,
  updateCategoryFieldSchema,
  reorderFieldsSchema,
} from "../validators";

async function assertCategory(categoryId: string) {
  const category = await categoryRepo.findById(categoryId);
  if (!category) throw ApiError.notFound("Category not found");
  return category;
}

export const listCategoryFields = asyncHandler(async (req: Request, res: Response) => {
  await assertCategory(req.params.id);
  const fields = await categoryFieldRepo.listFieldsForCategory(req.params.id);
  res.json({ success: true, data: fields });
});

export const attachField = asyncHandler(async (req: Request, res: Response) => {
  await assertCategory(req.params.id);
  const parsed = attachFieldSchema.safeParse(req.body);
  if (!parsed.success) throw ApiError.badRequest("VALIDATION_ERROR", "Validation failed", {});
  const field = await categoryFieldRepo.attach(req.params.id, parsed.data as any);
  res.status(201).json({ success: true, data: field });
});

export const updateCategoryField = asyncHandler(async (req: Request, res: Response) => {
  await assertCategory(req.params.id);
  const parsed = updateCategoryFieldSchema.safeParse(req.body);
  if (!parsed.success) throw ApiError.badRequest("VALIDATION_ERROR", "Validation failed", {});
  const field = await categoryFieldRepo.update(req.params.id, req.params.fieldId, parsed.data as any);
  res.json({ success: true, data: field });
});

export const removeCategoryField = asyncHandler(async (req: Request, res: Response) => {
  await assertCategory(req.params.id);
  const field = await categoryFieldRepo.remove(req.params.id, req.params.fieldId);
  res.json({ success: true, data: field });
});

export const reorderCategoryFields = asyncHandler(async (req: Request, res: Response) => {
  await assertCategory(req.params.id);
  const parsed = reorderFieldsSchema.safeParse(req.body);
  if (!parsed.success) throw ApiError.badRequest("VALIDATION_ERROR", "Validation failed", {});
  const fields = await categoryFieldRepo.reorder(req.params.id, parsed.data.fieldIds);
  res.json({ success: true, data: fields });
});
