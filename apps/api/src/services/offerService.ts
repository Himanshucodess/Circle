import * as offerRepo from "../repositories/offerRepository";
import * as listingRepo from "../repositories/listingRepository";
import { ApiError } from "../utils/ApiError";

export async function createOffer(listingId: string, body: { amount: number; message?: string }, bidderId?: string | null) {
  const listing = await listingRepo.findById(listingId);
  if (!listing) throw ApiError.notFound("Listing not found");

  const amount = Number(body.amount);
  if (!amount || amount <= 0) {
    throw ApiError.badRequest("VALIDATION_ERROR", "Offer amount must be greater than 0", { amount: "Amount must be > 0" });
  }
  if (amount > listing.price * 3) {
    throw ApiError.badRequest("VALIDATION_ERROR", "Offer amount seems too high", { amount: "Amount too high" });
  }

  const offer = await offerRepo.create({ listingId, amount, message: body.message ?? null, bidderId: bidderId || null });
  return offer;
}

export async function getOffers(listingId: string) {
  const listing = await listingRepo.findById(listingId);
  if (!listing) throw ApiError.notFound("Listing not found");
  return offerRepo.listByListing(listingId);
}

export async function updateOfferStatus(offerId: string, status: string) {
  const allowed = ["PENDING", "ACCEPTED", "REJECTED"];
  if (!allowed.includes(status)) throw ApiError.badRequest("VALIDATION_ERROR", "Invalid status");
  const offer = await offerRepo.findById(offerId);
  if (!offer) throw ApiError.notFound("Offer not found");
  return offerRepo.updateStatus(offerId, status);
}
