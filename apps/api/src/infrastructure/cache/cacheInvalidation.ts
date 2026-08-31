import { cacheKeys, cachePatterns } from "./cacheKeys";
import { cacheService } from "./cacheService";

export async function invalidateCategoryCaches(categoryId?: string) {
  await cacheService.delete(cacheKeys.activeCategories());
  if (categoryId) await cacheService.deleteByPattern(cachePatterns.categorySchemas(categoryId));
}

export async function invalidateListingCaches(listingId?: string) {
  await Promise.all([
    cacheService.deleteByPattern(cachePatterns.latestListings()),
    cacheService.deleteByPattern(cachePatterns.categoryListings()),
    listingId ? cacheService.delete(cacheKeys.listing(listingId)) : cacheService.deleteByPattern(cachePatterns.listingDetails()),
    listingId ? cacheService.delete(cacheKeys.pricing(listingId)) : Promise.resolve(),
    listingId ? cacheService.delete(cacheKeys.offerCompetitiveness(listingId)) : Promise.resolve(),
  ]);
}
