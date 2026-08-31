import * as offerRepo from "../repositories/offerRepository";
import * as listingRepo from "../repositories/listingRepository";
import { ApiError } from "../utils/ApiError";
import { invalidateListingCaches } from "../infrastructure/cache/cacheInvalidation";

export type OfferRating = "LOW" | "MODERATE" | "COMPETITIVE" | "EXCELLENT";
const messages: Record<OfferRating, string> = {
  LOW: "Your offer may be less competitive. Increasing it could improve your chances.",
  MODERATE: "Several buyers appear to be making stronger offers.",
  COMPETITIVE: "Your offer is competitive with current buyer activity.",
  EXCELLENT: "Your offer is highly competitive and may improve your chances.",
};

export async function getOfferCompetitiveness(listingId: string, offerAmount: number) {
  const listing = await listingRepo.findById(listingId);
  if (!listing) throw ApiError.notFound("Listing not found");
  const offers = await offerRepo.listPendingByListing(listingId);
  const asking = listing.price;
  let rating: OfferRating;
  if (!offers.length) rating = offerAmount >= asking * 0.95 ? "EXCELLENT" : offerAmount >= asking * 0.85 ? "MODERATE" : "LOW";
  else {
    const amounts = offers.map((offer) => offer.amount).sort((a, b) => a - b);
    const midpoint = amounts[Math.floor(amounts.length / 2)];
    rating = offerAmount >= Math.max(asking * 0.95, amounts[amounts.length - 1]) ? "EXCELLENT" : offerAmount >= midpoint ? "COMPETITIVE" : offerAmount >= asking * 0.85 ? "MODERATE" : "LOW";
  }
  return { rating, message: messages[rating] };
}

export async function createOffer(listingId: string, body: { amount: number; message?: string }, bidderId: string) {
  const listing = await listingRepo.findById(listingId);
  if (!listing) throw ApiError.notFound("Listing not found");
  if (listing.sellerId && listing.sellerId === bidderId) throw ApiError.badRequest("INVALID_OFFER", "You cannot make an offer on your own listing");

  const amount = Number(body.amount);
  if (!amount || amount <= 0) {
    throw ApiError.badRequest("VALIDATION_ERROR", "Offer amount must be greater than 0", { amount: "Amount must be > 0" });
  }
  if (amount > listing.price * 3) {
    throw ApiError.badRequest("VALIDATION_ERROR", "Offer amount seems too high", { amount: "Amount too high" });
  }

  const offer = await offerRepo.create({ listingId, amount: Math.round(amount), message: body.message?.trim() || null, bidderId });
  const competitiveness = await getOfferCompetitiveness(listingId, amount);
  await invalidateListingCaches(listingId);
  return { ...offer, competitiveness };
}

export async function getOffers(listingId: string, userId: string) {
  const listing = await listingRepo.findById(listingId);
  if (!listing) throw ApiError.notFound("Listing not found");
  if (listing.sellerId !== userId) throw ApiError.forbidden("You can only view offers on your own listings");
  return offerRepo.listByListing(listingId);
}

export async function updateOfferStatus(offerId: string, status: string) {
  const allowed = ["PENDING", "ACCEPTED", "REJECTED", "WITHDRAWN"];
  if (!allowed.includes(status)) throw ApiError.badRequest("VALIDATION_ERROR", "Invalid status");
  const offer = await offerRepo.findById(offerId);
  if (!offer) throw ApiError.notFound("Offer not found");
  const updated = await offerRepo.updateStatus(offerId, status);
  await invalidateListingCaches(offer.listingId);
  return updated;
}
