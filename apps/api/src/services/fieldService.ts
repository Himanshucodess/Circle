import * as fieldRepo from "../repositories/fieldRepository";
import prisma from "../lib/prisma";
import { ApiError } from "../utils/ApiError";
import { FieldType } from "@marketplace/shared";

export async function getFields() {
  const fields = await fieldRepo.listAll();
  return Promise.all(
    fields.map(async (f) => ({
      ...f,
      usedBy: await prisma.categoryField.count({ where: { fieldId: f.id } }),
    }))
  );
}

export async function getField(id: string) {
  const field = await fieldRepo.findById(id);
  if (!field) throw ApiError.notFound("Field not found");
  return field;
}

export async function createField(input: any) {
  return fieldRepo.create(input);
}

export async function updateField(id: string, input: any) {
  const existing = await fieldRepo.findById(id);
  if (!existing) throw ApiError.notFound("Field not found");
  if (input.key) {
    const clash = await fieldRepo.findByKeyNotSelf(id, input.key);
    if (clash) throw ApiError.conflict("DUPLICATE_KEY", "A field with this key already exists");
  }
  return fieldRepo.update(id, input);
}
