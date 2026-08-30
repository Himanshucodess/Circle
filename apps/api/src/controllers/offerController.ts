import { Request, Response } from "express";
import * as offerService from "../services/offerService";
import { asyncHandler } from "../utils/asyncHandler";

export const createOffer = asyncHandler(async (req: Request, res: Response) => {
  const bidderId = (req as any).user?.id || null;
  const offer = await offerService.createOffer(req.params.id, req.body, bidderId);
  res.status(201).json({ success: true, data: offer });
});

export const listOffers = asyncHandler(async (req: Request, res: Response) => {
  const offers = await offerService.getOffers(req.params.id);
  res.json({ success: true, data: offers });
});
