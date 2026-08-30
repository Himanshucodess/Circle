import { Request, Response } from "express";
import * as categoryService from "../services/categoryService";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { createCategorySchema, updateCategorySchema } from "../validators";

export const listCategories = asyncHandler(async (req: Request, res: Response) => {
  const categories = await categoryService.getCategories();
  res.json({ success: true, data: categories });
});

export const listCategoriesAdmin = asyncHandler(async (req: Request, res: Response) => {
  const categories = await categoryService.getCategoriesAdmin();
  res.json({ success: true, data: categories });
});

export const getCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.getCategory(req.params.id);
  res.json({ success: true, data: category });
});

export const getCategoryAdmin = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.getCategoryAdmin(req.params.id);
  res.json({ success: true, data: category });
});

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const parsed = createCategorySchema.safeParse(req.body);
  if (!parsed.success) {
    throw ApiError.badRequest("VALIDATION_ERROR", "Validation failed", {});
  }
  const category = await categoryService.createCategory(parsed.data);
  res.status(201).json({ success: true, data: category });
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const parsed = updateCategorySchema.safeParse(req.body);
  if (!parsed.success) {
    throw ApiError.badRequest("VALIDATION_ERROR", "Validation failed", {});
  }
  const category = await categoryService.updateCategory(req.params.id, parsed.data);
  res.json({ success: true, data: category });
});

export const archiveCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoryService.archiveCategory(req.params.id);
  res.json({ success: true, data: category });
});

export const dashboardStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await categoryService.getDashboardStats();
  res.json({ success: true, data: stats });
});
