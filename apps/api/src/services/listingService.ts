import * as listingRepo from "../repositories/listingRepository";
import * as schemaRepo from "../repositories/schemaRepository";
import * as categoryRepo from "../repositories/categoryRepository";
import { ApiError } from "../utils/ApiError";
import { validateAttributes } from "../utils/dynamicValidation";
import { createListingSchema } from "../validators";
import { SchemaField } from "@marketplace/shared";
import * as imageUploadRepo from "../repositories/imageUploadRepository";
import * as cloudinaryService from "./cloudinaryService";
import { CACHE_TTL, cacheKeys } from "../infrastructure/cache/cacheKeys";
import { cacheService } from "../infrastructure/cache/cacheService";
import { invalidateListingCaches } from "../infrastructure/cache/cacheInvalidation";

function toDto(listing: any) {
  const images = (listing.images ?? []).map((img: any) => ({
    id: img.id,
    url: img.url,
    displayOrder: img.displayOrder,
    publicId: img.publicId,
  }));
  return {
    id: listing.id,
    title: listing.title,
    description: listing.description,
    price: listing.price,
    condition: listing.condition,
    location: listing.location,
    viewCount: listing.viewCount ?? 0,
    offerCount: listing._count?.offers ?? listing.offerCount ?? 0,
    attributes: listing.attributes,
    category: {
      id: listing.category.id,
      name: listing.category.name,
      slug: listing.category.slug,
      icon: listing.category.icon,
    },
    schemaVersion: listing.schema ? listing.schema.version : null,
    images,
    createdAt: listing.createdAt,
    seller: listing.seller ? { id: listing.seller.id, name: listing.seller.name, avatar: listing.seller.avatar, memberSince: listing.seller.createdAt } : null,
  };
}

export async function getListings(limit?: number, opts?: { search?: string; category?: string }) {
  const effectiveLimit = limit ?? 12;
  const cacheKey = !opts?.search
    ? opts?.category
      ? cacheKeys.categoryListings(opts.category, effectiveLimit)
      : cacheKeys.latestListings(effectiveLimit)
    : null;
  if (cacheKey) {
    const cached = await cacheService.get<any[]>(cacheKey);
    if (cached) return cached;
  }

  const rows = await listingRepo.listRecent(effectiveLimit, { search: opts?.search, categorySlug: opts?.category });
  const listings = rows.map(toDto);
  if (cacheKey) await cacheService.set(cacheKey, listings, CACHE_TTL.LISTINGS);
  return listings;
}

export async function getListing(id: string) {
  const cacheKey = cacheKeys.listing(id);
  const cached = await cacheService.get<any>(cacheKey);
  if (cached) return cached;

  const listing = await listingRepo.findById(id);
  if (!listing) throw ApiError.notFound("Listing not found");

  const dto: any = toDto(listing);

  // Exact offer amounts are private to the seller and are never part of the public listing DTO.
  try {
    const offerCount = await listingRepo.countOffers(id);
    dto.offerCount = offerCount;
  } catch {}

  // Pricing insight
  try {
    const pricingKey = cacheKeys.pricing(listing.id);
    let pricing = await cacheService.get<any>(pricingKey);
    if (!pricing) {
      pricing = await (await import("./pricingService")).getPricingInsight(listing.price, listing.categoryId, listing.id);
      await cacheService.set(pricingKey, pricing, CACHE_TTL.PRICING);
    }
    dto.pricingInsight = { ...pricing, medianPrice: undefined, range: undefined };
  } catch {}

  // Load the schema snapshot referenced by this listing so we can render
  // its attributes dynamically (old versions remain compatible).
  if (listing.schemaVersionId) {
    const schemaVersion = await schemaRepo.findById(listing.schemaVersionId);
    if (schemaVersion) {
      const snapshot = schemaVersion.schemaJson as unknown as { fields: SchemaField[] };
      dto.schema = {
        fields: snapshot.fields ?? [],
      };
    }
  } else {
    const latest = await schemaRepo.latestPublished(listing.categoryId);
    if (latest) {
      const snapshot = latest.schemaJson as unknown as { fields: SchemaField[] };
      dto.schema = { fields: snapshot.fields ?? [] };
    }
  }

  await cacheService.set(cacheKey, dto, CACHE_TTL.LISTINGS);
  return dto as any;
}

export async function createListing(body: unknown, sellerId?: string | null) {
  const parsed = createListingSchema.safeParse(body);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fields[issue.path.join(".")] = issue.message;
    }
    throw ApiError.badRequest("VALIDATION_ERROR", "Validation failed", fields);
  }

  const data = parsed.data;
  const category = await categoryRepo.findActive(data.categoryId);
  if (!category) throw ApiError.notFound("Category not found");

  const latestSchema = await schemaRepo.latestPublished(category.id);
  if (!latestSchema) {
    throw ApiError.badRequest(
      "NO_PUBLISHED_SCHEMA",
      `No published schema available for ${category.name}`
    );
  }

  const snapshot = latestSchema.schemaJson as unknown as { fields: SchemaField[] };
  const fields = snapshot.fields ?? [];

  const validation = validateAttributes(fields, data.attributes ?? {});

  if (!validation.valid) {
    throw ApiError.badRequest(
      "VALIDATION_ERROR",
      "Some category attributes are invalid",
      validation.errors
    );
  }

  const uploadedIds = (data.images ?? []).map((image) => image.uploadId).filter(Boolean) as string[];
  if ((data.images ?? []).some((image) => image.publicId && !image.uploadId)) {
    throw ApiError.badRequest("INVALID_IMAGE_UPLOAD", "Product photos must be uploaded through CircleStore.");
  }
  if (new Set(uploadedIds).size !== uploadedIds.length) {
    throw ApiError.badRequest("DUPLICATE_IMAGE", "Each product photo can only be added once.");
  }
  const ownedUploads = await imageUploadRepo.findOwnedByIds(uploadedIds, sellerId || "");
  if (ownedUploads.length !== uploadedIds.length || ownedUploads.some((upload) => !data.images?.some((image) => image.uploadId === upload.id && image.publicId === upload.publicId && image.url === upload.url))) {
    throw ApiError.forbidden("One or more product photos are not owned by you.");
  }

  let listing;
  try {
    listing = await listingRepo.create({
    categoryId: category.id,
    schemaVersionId: latestSchema.id,
    sellerId: sellerId || null,
    title: data.title,
    description: data.description,
    price: data.price,
    condition: data.condition,
    location: data.location,
    attributes: validation.sanitized,
    images: (data.images ?? []).map((img, i) => ({
      url: img.url,
      publicId: img.publicId,
      uploadId: img.uploadId,
      displayOrder: img.displayOrder ?? i,
    })),
    }, sellerId || "", uploadedIds);
  } catch (error) {
    // The upload records remain available for a retry, but if creation failed after
    // validation, remove the associated assets to avoid abandoned Cloudinary files.
    for (const upload of ownedUploads) {
      try { await cloudinaryService.deleteImage(upload.publicId); } catch {}
    }
    await imageUploadRepo.deleteMany(uploadedIds, sellerId || "").catch(() => {});
    throw error;
  }

  await invalidateListingCaches(listing.id);
  return toDto(listing);
}

export async function recordView(id: string) {
  const listing = await listingRepo.findById(id);
  if (!listing) throw ApiError.notFound("Listing not found");
  await listingRepo.incrementViewCount(id);
  await cacheService.delete(cacheKeys.listing(id));
  return { viewCount: (listing.viewCount ?? 0) + 1 };
}

export async function getSellerListings(sellerId: string) {
  return (await listingRepo.listBySeller(sellerId)).map(toDto);
}

export async function deleteListing(listingId: string, sellerId: string) {
  const listing = await listingRepo.findById(listingId);
  if (!listing) throw ApiError.notFound("Listing not found");
  if (!listing.sellerId || listing.sellerId !== sellerId) {
    throw ApiError.forbidden("You can only remove your own listings");
  }

  // Delete the database record first. ListingImage and Offer rows cascade with
  // the listing; Cloudinary cleanup is best-effort and never blocks removal.
  await listingRepo.deleteListing(listingId);
  for (const image of listing.images) {
    if (!image.publicId) continue;
    try {
      await cloudinaryService.deleteImage(image.publicId);
    } catch (error) {
      console.warn("[listing] image cleanup failed after listing removal", error);
    }
  }
  await invalidateListingCaches(listingId);
  return { removed: true };
}

export async function deleteListingImage(listingId: string, imageId: string, sellerId: string) {
  const image = await listingRepo.findImage(imageId);
  if (!image || image.listingId !== listingId) throw ApiError.notFound("Listing image not found");
  if (image.listing.sellerId !== sellerId) throw ApiError.forbidden("You cannot modify this listing");
  if (image.publicId) {
    try { await cloudinaryService.deleteImage(image.publicId); } catch (error) { console.warn("[listing] image cleanup failed", error); }
  }
  await listingRepo.deleteImage(imageId);
  await invalidateListingCaches(listingId);
  return { removed: true };
}

export async function reorderListingImages(listingId: string, imageIds: string[], sellerId: string) {
  const listing = await listingRepo.findById(listingId);
  if (!listing) throw ApiError.notFound("Listing not found");
  if (listing.sellerId !== sellerId) throw ApiError.forbidden("You cannot modify this listing");
  const currentIds = listing.images.map((image: any) => image.id);
  if (currentIds.length !== imageIds.length || currentIds.some((id: string) => !imageIds.includes(id))) {
    throw ApiError.badRequest("INVALID_IMAGE_ORDER", "Image order does not match this listing.");
  }
  await listingRepo.reorderImages(listingId, imageIds);
  await invalidateListingCaches(listingId);
  return (await listingRepo.findById(listingId))?.images ?? [];
}
