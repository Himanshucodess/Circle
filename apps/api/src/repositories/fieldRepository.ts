import prisma from "../lib/prisma";
import { ApiError } from "../utils/ApiError";

export interface CreateFieldInput {
  key: string;
  label: string;
  type: string;
  description?: string;
  config: Record<string, unknown>;
}

export async function findByKey(key: string) {
  return prisma.fieldDefinition.findUnique({ where: { key } });
}

export async function findById(id: string) {
  return prisma.fieldDefinition.findUnique({ where: { id } });
}

export async function listAll() {
  return prisma.fieldDefinition.findMany({ orderBy: { createdAt: "asc" } });
}

export async function create(data: CreateFieldInput) {
  try {
    return await prisma.fieldDefinition.create({
      data: {
        key: data.key,
        label: data.label,
        type: data.type as any,
        description: data.description,
        config: data.config as any,
      },
    } as any);
  } catch (e: any) {
    if (e?.code === "P2002") {
      throw ApiError.conflict("DUPLICATE_KEY", "A field with this key already exists");
    }
    throw e;
  }
}

export async function update(id: string, data: Partial<CreateFieldInput>) {
  try {
    return await prisma.fieldDefinition.update({
      where: { id },
      data: {
        ...(data.label !== undefined ? { label: data.label } : {}),
        ...(data.type !== undefined ? { type: data.type as any } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.config !== undefined ? { config: data.config as any } : {}),
      },
    } as any);
  } catch (e: any) {
    if (e?.code === "P2002") {
      throw ApiError.conflict("DUPLICATE_KEY", "A field with this key already exists");
    }
    throw e;
  }
}

export async function countAll() {
  return prisma.fieldDefinition.count();
}

export async function findByKeyNotSelf(id: string, key: string) {
  return prisma.fieldDefinition.findFirst({
    where: { key, NOT: { id } },
  });
}
