import prisma from "../lib/prisma";

export async function findByClerkId(clerkId: string) {
  return prisma.user.findUnique({ where: { clerkId } });
}

export async function findByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function findById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export async function createOrUpdateClerk(data: {
  clerkId: string;
  email: string;
  name?: string | null;
  avatar?: string | null;
}) {
  const existing = await findByClerkId(data.clerkId);
  if (existing) {
    return prisma.user.update({
      where: { id: existing.id },
      data: { email: data.email, name: data.name, avatar: data.avatar },
    });
  }
  const byEmail = await findByEmail(data.email);
  if (byEmail) {
    return prisma.user.update({
      where: { id: byEmail.id },
      data: { clerkId: data.clerkId, name: data.name, avatar: data.avatar },
    });
  }
  return prisma.user.create({
    data: {
      clerkId: data.clerkId,
      email: data.email,
      name: data.name,
      avatar: data.avatar,
    },
  });
}
