import { Request, Response } from "express";
import * as fieldService from "../services/fieldService";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { createFieldSchema, updateFieldSchema } from "../validators";

export const listFields = asyncHandler(async (req: Request, res: Response) => {
  const fields = await fieldService.getFields();
  res.json({ success: true, data: fields });
});

export const getField = asyncHandler(async (req: Request, res: Response) => {
  const field = await fieldService.getField(req.params.id);
  res.json({ success: true, data: field });
});

export const createField = asyncHandler(async (req: Request, res: Response) => {
  const parsed = createFieldSchema.safeParse(req.body);
  if (!parsed.success) {
    throw ApiError.badRequest("VALIDATION_ERROR", "Validation failed", {});
  }
  const field = await fieldService.createField(parsed.data);
  res.status(201).json({ success: true, data: field });
});

export const updateField = asyncHandler(async (req: Request, res: Response) => {
  const parsed = updateFieldSchema.safeParse(req.body);
  if (!parsed.success) {
    throw ApiError.badRequest("VALIDATION_ERROR", "Validation failed", {});
  }
  const field = await fieldService.updateField(req.params.id, parsed.data);
  res.json({ success: true, data: field });
});
