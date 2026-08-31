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
  images: { url: string; publicId?: string; uploadId?: string; displayOrder: number }[];
}

export async function create(data: CreateListingInput, ownerId: string, uploadIds: string[]) {
  return prisma.$transaction(async (tx) => {
    const listing = await tx.listing.create({
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
          publicId: img.publicId,
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
    if (uploadIds.length) await tx.imageUpload.deleteMany({ where: { id: { in: uploadIds }, ownerId } });
    return listing;
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

export async function findImage(id: string) {
  return prisma.listingImage.findUnique({ where: { id }, include: { listing: { select: { sellerId: true } } } });
}

export async function deleteImage(id: string) {
  return prisma.listingImage.delete({ where: { id } });
}

export async function reorderImages(listingId: string, imageIds: string[]) {
  await prisma.$transaction(imageIds.map((id, index) => prisma.listingImage.update({ where: { id }, data: { displayOrder: index } })));
}

export async function deleteListing(id: string) {
  return prisma.listing.delete({ where: { id } });
}
