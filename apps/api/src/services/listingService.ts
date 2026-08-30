import * as listingRepo from "../repositories/listingRepository";
import * as schemaRepo from "../repositories/schemaRepository";
import * as categoryRepo from "../repositories/categoryRepository";
import { ApiError } from "../utils/ApiError";
import { validateAttributes } from "../utils/dynamicValidation";
import { createListingSchema } from "../validators";
import { SchemaField } from "@marketplace/shared";

function toDto(listing: any) {
  const images = (listing.images ?? []).map((img: any) => ({
    id: img.id,
    url: img.url,
    displayOrder: img.displayOrder,
  }));
  return {
    id: listing.id,
    title: listing.title,
    description: listing.description,
    price: listing.price,
    condition: listing.condition,
    location: listing.location,
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
  };
}

export async function getListings(limit?: number) {
  const rows = await listingRepo.listRecent(limit);
  return rows.map(toDto);
}

export async function getListing(id: string) {
  const listing = await listingRepo.findById(id);
  if (!listing) throw ApiError.notFound("Listing not found");

  const dto = toDto(listing);

  // Load the schema snapshot referenced by this listing so we can render
  // its attributes dynamically (old versions remain compatible).
  if (listing.schemaVersionId) {
    const schemaVersion = await schemaRepo.findById(listing.schemaVersionId);
    if (schemaVersion) {
      const snapshot = schemaVersion.schemaJson as unknown as { fields: SchemaField[] };
      (dto as any)["schema"] = {
        fields: snapshot.fields ?? [],
      };
    }
  } else {
    // Fallback: use latest published schema
    const latest = await schemaRepo.latestPublished(listing.categoryId);
    if (latest) {
      const snapshot = latest.schemaJson as unknown as { fields: SchemaField[] };
      (dto as any)["schema"] = { fields: snapshot.fields ?? [] };
    }
  }

  return dto as any;
}

export async function createListing(body: unknown) {
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

  const listing = await listingRepo.create({
    categoryId: category.id,
    schemaVersionId: latestSchema.id,
    title: data.title,
    description: data.description,
    price: data.price,
    condition: data.condition,
    location: data.location,
    attributes: validation.sanitized,
    images: (data.images ?? []).map((img, i) => ({
      url: img.url,
      displayOrder: img.displayOrder ?? i,
    })),
  });

  return toDto(listing);
}
