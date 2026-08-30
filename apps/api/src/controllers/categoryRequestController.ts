import { Request, Response } from "express";
import * as service from "../services/categoryRequestService";
import { asyncHandler } from "../utils/asyncHandler";

export const createRequest = asyncHandler(async (req: any, res: Response) => {
  const data = await service.createRequest(req.body, req.user.id);
  res.status(201).json({ success: true, data });
});

export const listMine = asyncHandler(async (req: any, res: Response) => {
  res.json({ success: true, data: await service.listMine(req.user.id) });
});

export const listAdmin = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ success: true, data: await service.listAll() });
});

export const review = asyncHandler(async (req: any, res: Response) => {
  const data = await service.reviewRequest(req.params.id, req.body?.status, req.body?.adminNote, req.admin?.username || "admin");
  res.json({ success: true, data });
});
