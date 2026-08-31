import prisma from "../lib/prisma";

export async function create(data: { ownerId: string; url: string; publicId: string }) {
  return prisma.imageUpload.create({ data });
}

export async function findById(id: string) {
  return prisma.imageUpload.findUnique({ where: { id } });
}

export async function findOwnedByIds(ids: string[], ownerId: string) {
  if (!ids.length) return [];
  return prisma.imageUpload.findMany({ where: { id: { in: ids }, ownerId } });
}

export async function deleteById(id: string) {
  return prisma.imageUpload.delete({ where: { id } });
}

export async function deleteMany(ids: string[], ownerId: string) {
  if (!ids.length) return;
  await prisma.imageUpload.deleteMany({ where: { id: { in: ids }, ownerId } });
}
