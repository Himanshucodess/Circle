export const CACHE_TTL = {
  CATEGORY: 600,
  SCHEMA: 600,
  LISTINGS: 60,
  PRICING: 300,
  OFFER_COMPETITIVENESS: 30,
} as const;

export const cacheKeys = {
  activeCategories: () => "categories:active",
  categorySchema: (categoryId: string, schemaVersionId: string) => `category:schema:${categoryId}:${schemaVersionId}`,
  latestListings: (limit: number) => (limit === 40 ? "listings:latest" : `listings:latest:${limit}`),
  categoryListings: (category: string, limit: number) => `listings:category:${category}:${limit}`,
  listing: (listingId: string) => `listing:${listingId}`,
  pricing: (listingId: string) => `pricing:${listingId}`,
  offerCompetitiveness: (listingId: string) => `offer-competitiveness:${listingId}`,
};

export const cachePatterns = {
  categorySchemas: (categoryId: string) => `category:schema:${categoryId}:*`,
  latestListings: () => "listings:latest*",
  categoryListings: () => "listings:category:*",
};
