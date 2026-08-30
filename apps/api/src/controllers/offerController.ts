import { Request, Response } from "express";
import * as offerService from "../services/offerService";
import { asyncHandler } from "../utils/asyncHandler";

export const createOffer = asyncHandler(async (req: Request, res: Response) => {
  const bidderId = (req as any).user.id;
  const offer = await offerService.createOffer(req.params.id, req.body, bidderId);
  res.status(201).json({ success: true, data: offer });
});

export const listOffers = asyncHandler(async (req: Request, res: Response) => {
  const offers = await offerService.getOffers(req.params.id, (req as any).user.id);
  res.json({ success: true, data: offers });
});

export const competitiveness = asyncHandler(async (req: Request, res: Response) => {
  const amount = Number(req.query.amount);
  if (!Number.isFinite(amount) || amount <= 0) return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "Enter a valid offer amount" } });
  res.json({ success: true, data: await offerService.getOfferCompetitiveness(req.params.id, amount) });
});
