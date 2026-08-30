import prisma from "../lib/prisma";
import { ApiError } from "../utils/ApiError";

export async function latestPublished(categoryId: string) {
  return prisma.schemaVersion.findFirst({
    where: { categoryId, status: "PUBLISHED" },
    orderBy: { version: "desc" },
  });
}

export async function listVersions(categoryId: string) {
  return prisma.schemaVersion.findMany({
    where: { categoryId },
    orderBy: { version: "desc" },
  });
}

export async function findById(id: string) {
  return prisma.schemaVersion.findUnique({ where: { id } });
}

export async function getNextVersion(categoryId: string) {
  const last = await prisma.schemaVersion.findFirst({
    where: { categoryId },
    orderBy: { version: "desc" },
  });
  return (last?.version ?? 0) + 1;
}

export async function createDraft(categoryId: string) {
  const version = await getNextVersion(categoryId);
  return prisma.schemaVersion.create({
    data: {
      categoryId,
      version,
      status: "DRAFT",
      schemaJson: { fields: [] },
    },
  });
}

export async function getDraft(categoryId: string) {
  return prisma.schemaVersion.findFirst({
    where: { categoryId, status: "DRAFT" },
    orderBy: { version: "desc" },
  });
}

export async function updateDraftSchema(id: string, schemaJson: unknown, uiSchemaJson?: unknown) {
  return prisma.schemaVersion.update({
    where: { id },
    data: {
      schemaJson: schemaJson as any,
      ...(uiSchemaJson !== undefined ? { uiSchemaJson: uiSchemaJson as any } : {}),
    },
  } as any);
}

export async function publish(id: string, categoryId: string) {
  return prisma.$transaction(async (tx) => {
    await tx.schemaVersion.updateMany({
      where: { categoryId, status: "PUBLISHED" },
      data: { status: "ARCHIVED" },
    });
    return tx.schemaVersion.update({
      where: { id },
      data: { status: "PUBLISHED", publishedAt: new Date() },
    });
  });
}

export async function ensureDraft(categoryId: string) {
  let draft = await getDraft(categoryId);
  if (!draft) {
    draft = await createDraft(categoryId);
  }
  return draft;
}
