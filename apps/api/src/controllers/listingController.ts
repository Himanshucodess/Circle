import { Request, Response } from "express";
import * as listingService from "../services/listingService";
import { asyncHandler } from "../utils/asyncHandler";

export const listListings = asyncHandler(async (req: Request, res: Response) => {
  const limit = req.query.limit ? Number(req.query.limit) : 12;
  const listings = await listingService.getListings(limit);
  res.json({ success: true, data: listings });
});

export const getListing = asyncHandler(async (req: Request, res: Response) => {
  const listing = await listingService.getListing(req.params.id);
  res.json({ success: true, data: listing });
});

export const createListing = asyncHandler(async (req: Request, res: Response) => {
  const listing = await listingService.createListing(req.body);
  res.status(201).json({ success: true, data: listing });
});
