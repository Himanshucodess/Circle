import prisma from "../lib/prisma";

export interface CreateListingInput {
  categoryId: string;
  schemaVersionId: string | null;
  sellerId?: string | null;
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
      sellerId: data.sellerId,
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
      seller: { select: { id: true, name: true, avatar: true, createdAt: true } },
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
      seller: { select: { id: true, name: true, avatar: true, createdAt: true } },
    },
  });
}

export async function listRecent(limit = 12, opts?: { search?: string; categorySlug?: string }) {
  const where: any = {};
  if (opts?.search) {
    const s = opts.search;
    where.OR = [
      { title: { contains: s, mode: "insensitive" } },
      { description: { contains: s, mode: "insensitive" } },
      { category: { name: { contains: s, mode: "insensitive" } } },
    ];
  }
  if (opts?.categorySlug) {
    where.category = { slug: opts.categorySlug };
  }
  return prisma.listing.findMany({
    where: Object.keys(where).length ? where : undefined,
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      category: true,
      images: { orderBy: { displayOrder: "asc" } },
      schema: { select: { version: true } },
      _count: { select: { offers: { where: { status: "PENDING" } } } },
    },
  });
}

export async function countAll() {
  return prisma.listing.count();
}

export async function incrementViewCount(id: string) {
  return prisma.listing.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  });
}

export async function findComparableByCategory(categoryId: string, excludeId?: string) {
  return prisma.listing.findMany({
    where: {
      categoryId,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { price: true, attributes: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

export async function countOffers(listingId: string) {
  return prisma.offer.count({ where: { listingId, status: "PENDING" } });
}

export async function listBySeller(sellerId: string) {
  return prisma.listing.findMany({
    where: { sellerId },
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      images: { orderBy: { displayOrder: "asc" } },
      schema: { select: { version: true } },
      seller: { select: { id: true, name: true, avatar: true, createdAt: true } },
      _count: { select: { offers: { where: { status: "PENDING" } } } },
    },
  });
}
