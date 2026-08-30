import prisma from "../lib/prisma";
import { ApiError } from "../utils/ApiError";
import { ConditionalRule } from "@marketplace/shared";

export interface AttachFieldInput {
  fieldId: string;
  isRequired?: boolean;
  conditionalRule?: ConditionalRule | null;
}

export async function listFieldsForCategory(categoryId: string) {
  return prisma.categoryField.findMany({
    where: { categoryId },
    include: { field: true },
    orderBy: { displayOrder: "asc" },
  });
}

export async function findByCategoryAndField(categoryId: string, fieldId: string) {
  return prisma.categoryField.findUnique({
    where: { categoryId_fieldId: { categoryId, fieldId } },
    include: { field: true },
  });
}

export async function attach(categoryId: string, input: AttachFieldInput) {
  const existing = await prisma.categoryField.findUnique({
    where: { categoryId_fieldId: { categoryId, fieldId: input.fieldId } },
  });
  if (existing) {
    throw ApiError.conflict("FIELD_ALREADY_ATTACHED", "This field is already attached to the category");
  }

  const maxOrder = await prisma.categoryField.aggregate({
    where: { categoryId },
    _max: { displayOrder: true },
  });

  return prisma.categoryField.create({
    data: {
      categoryId,
      fieldId: input.fieldId,
      isRequired: input.isRequired ?? false,
      conditionalRule: (input.conditionalRule ?? undefined) as any,
      displayOrder: (maxOrder._max.displayOrder ?? -1) + 1,
    },
    include: { field: true },
  } as any);
}

export async function update(
  categoryId: string,
  fieldId: string,
  data: {
    isRequired?: boolean;
    displayOrder?: number;
    conditionalRule?: ConditionalRule | null;
  }
) {
  const existing = await findByCategoryAndField(categoryId, fieldId);
  if (!existing) throw ApiError.notFound("Field is not attached to this category");

  const updateData: any = {};
  if (data.isRequired !== undefined) updateData.isRequired = data.isRequired;
  if (data.displayOrder !== undefined) updateData.displayOrder = data.displayOrder;
  if (data.conditionalRule !== undefined) updateData.conditionalRule = data.conditionalRule;

  return prisma.categoryField.update({
    where: { categoryId_fieldId: { categoryId, fieldId } },
    data: updateData,
    include: { field: true },
  });
}

export async function remove(categoryId: string, fieldId: string) {
  const existing = await findByCategoryAndField(categoryId, fieldId);
  if (!existing) throw ApiError.notFound("Field is not attached to this category");
  await prisma.categoryField.delete({
    where: { categoryId_fieldId: { categoryId, fieldId } },
  });
  return existing;
}

export async function reorder(categoryId: string, orderedFieldIds: string[]) {
  return prisma.$transaction(
    orderedFieldIds.map((fieldId, index) =>
      prisma.categoryField.update({
        where: { categoryId_fieldId: { categoryId, fieldId } },
        data: { displayOrder: index },
      })
    )
  );
}
