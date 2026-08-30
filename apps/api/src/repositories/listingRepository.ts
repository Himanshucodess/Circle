import prisma from "../lib/prisma";

export interface CreateListingInput {
  categoryId: string;
  schemaVersionId: string | null;
  title: string;
  description: string;
  price: number;
  condition: string;
  location: string;
  attributes: Record<string, unknown>;
  images: { url: string; displayOrder: number }[];
}

export async function create(data: CreateListingInput) {
  return prisma.listing.create({
    data: {
      categoryId: data.categoryId,
      schemaVersionId: data.schemaVersionId,
      title: data.title,
      description: data.description,
      price: data.price,
      condition: data.condition,
      location: data.location,
      attributes: data.attributes as any,
      images: {
        create: data.images.map((img, i) => ({
          url: img.url,
          displayOrder: data.images[i]?.displayOrder ?? i,
        })),
      },
    },
    include: {
      category: true,
      images: { orderBy: { displayOrder: "asc" } },
      schema: { select: { version: true } },
    },
  });
}

export async function findById(id: string) {
  return prisma.listing.findUnique({
    where: { id },
    include: {
      category: true,
      images: { orderBy: { displayOrder: "asc" } },
      schema: { select: { version: true } },
    },
  });
}

export async function listRecent(limit = 12) {
  return prisma.listing.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      category: true,
      images: { orderBy: { displayOrder: "asc" } },
      schema: { select: { version: true } },
    },
  });
}

export async function countAll() {
  return prisma.listing.count();
}
