import { Request, Response } from "express";
import * as schemaService from "../services/schemaService";
import { asyncHandler } from "../utils/asyncHandler";

export const getSellerSchema = asyncHandler(async (req: Request, res: Response) => {
  const schema = await schemaService.getSellerSchema(req.params.id);
  res.json({ success: true, data: schema });
});

export const getSchemaVersions = asyncHandler(async (req: Request, res: Response) => {
  const versions = await schemaService.getSchemaVersionsAdmin(req.params.id);
  res.json({ success: true, data: versions });
});

export const getDraftSchema = asyncHandler(async (req: Request, res: Response) => {
  const draft = await schemaService.getDraftSchema(req.params.id);
  res.json({ success: true, data: draft });
});

export const saveDraft = asyncHandler(async (req: Request, res: Response) => {
  const draft = await schemaService.saveDraft(req.params.id);
  res.json({ success: true, data: draft });
});

export const publishSchema = asyncHandler(async (req: Request, res: Response) => {
  const version = await schemaService.publishCategory(req.params.id);
  res.status(201).json({ success: true, data: version });
});
