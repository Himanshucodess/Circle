import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient;

if (process.env.NODE_ENV === "test") {
  prisma = new PrismaClient();
} else {
  const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
  globalForPrisma.prisma ??= new PrismaClient();
  prisma = globalForPrisma.prisma;
}

export default prisma;
