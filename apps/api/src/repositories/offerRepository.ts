import prisma from "../lib/prisma";

export async function create(data: { listingId: string; amount: number; message?: string | null; bidderId?: string | null }) {
  return prisma.offer.create({
    data: {
      listingId: data.listingId,
      bidderId: data.bidderId,
      amount: data.amount,
      message: data.message,
      status: "PENDING",
    },
  });
}

export async function listByListing(listingId: string) {
  return prisma.offer.findMany({
    where: { listingId },
    orderBy: { createdAt: "desc" },
  });
}

export async function listPendingByListing(listingId: string) {
  return prisma.offer.findMany({ where: { listingId, status: "PENDING" }, orderBy: { createdAt: "desc" } });
}

export async function countByListing(listingId: string) {
  return prisma.offer.count({ where: { listingId, status: "PENDING" } });
}

export async function updateStatus(id: string, status: string) {
  return prisma.offer.update({ where: { id }, data: { status } });
}

export async function findById(id: string) {
  return prisma.offer.findUnique({ where: { id } });
}
