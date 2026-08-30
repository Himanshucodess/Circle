import prisma from "../lib/prisma";
import { ApiError } from "../utils/ApiError";

export interface CreateCategoryInput {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
}

export async function findBySlug(slug: string) {
  return prisma.category.findUnique({ where: { slug } });
}

export async function findById(id: string) {
  return prisma.category.findUnique({ where: { id } });
}

export async function findActive(idOrSlug: string) {
  return prisma.category.findFirst({
    where: {
      OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      status: "ACTIVE",
    },
  });
}

export async function listAll() {
  return prisma.category.findMany({ orderBy: { createdAt: "asc" } });
}

export async function listActive() {
  return prisma.category.findMany({
    where: { status: "ACTIVE" },
    orderBy: { name: "asc" },
  });
}

export async function create(data: CreateCategoryInput) {
  try {
    return await prisma.category.create({ data });
  } catch (e: any) {
    if (e?.code === "P2002") {
      throw ApiError.conflict("DUPLICATE_SLUG", "A category with this slug already exists");
    }
    throw e;
  }
}

export async function update(id: string, data: Partial<CreateCategoryInput>) {
  try {
    return await prisma.category.update({ where: { id }, data });
  } catch (e: any) {
    if (e?.code === "P2002") {
      throw ApiError.conflict("DUPLICATE_SLUG", "A category with this slug already exists");
    }
    throw e;
  }
}

export async function archive(id: string) {
  return prisma.category.update({ where: { id }, data: { status: "ARCHIVED" } });
}

export async function countAll() {
  return prisma.category.count();
}

export async function countActive() {
  return prisma.category.count({ where: { status: "ACTIVE" } });
}
