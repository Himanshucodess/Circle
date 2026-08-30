import prisma from "../lib/prisma";

export async function findByProvider(provider: string, providerId: string) {
  return prisma.user.findFirst({ where: { provider, providerId } });
}

export async function findByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function findById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export async function createOrUpdateOAuth(data: {
  email: string;
  name?: string | null;
  avatar?: string | null;
  provider: string;
  providerId: string;
}) {
  const existingByProvider = await findByProvider(data.provider, data.providerId);
  if (existingByProvider) {
    return prisma.user.update({
      where: { id: existingByProvider.id },
      data: { name: data.name, avatar: data.avatar, email: data.email },
    });
  }
  const existingByEmail = await findByEmail(data.email);
  if (existingByEmail) {
    return prisma.user.update({
      where: { id: existingByEmail.id },
      data: { provider: data.provider, providerId: data.providerId, name: data.name, avatar: data.avatar },
    });
  }
  return prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      avatar: data.avatar,
      provider: data.provider,
      providerId: data.providerId,
    },
  });
}
