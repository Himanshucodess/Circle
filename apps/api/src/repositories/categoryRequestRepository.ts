import prisma from "../lib/prisma";

export async function create(data: { requestedBy: string; name: string; slug: string; description: string; reason: string; exampleProducts?: string | null }) {
  return prisma.categoryRequest.create({ data });
}

export async function findDuplicate(slug: string) {
  return prisma.categoryRequest.findFirst({ where: { slug, status: { in: ["PENDING", "APPROVED"] } } });
}

export async function listMine(requestedBy: string) {
  return prisma.categoryRequest.findMany({ where: { requestedBy }, orderBy: { createdAt: "desc" } });
}

export async function listAll() {
  return prisma.categoryRequest.findMany({ include: { requester: { select: { id: true, name: true, email: true, avatar: true } } }, orderBy: { createdAt: "desc" } });
}

export async function findById(id: string) {
  return prisma.categoryRequest.findUnique({ where: { id } });
}

export async function update(id: string, data: any) {
  return prisma.categoryRequest.update({ where: { id }, data, include: { requester: { select: { id: true, name: true, email: true, avatar: true } } } });
}
