import * as categoryFieldRepo from "../repositories/categoryFieldRepository";
import * as schemaRepo from "../repositories/schemaRepository";
import * as categoryRepo from "../repositories/categoryRepository";
import { ApiError } from "../utils/ApiError";
import { buildSchemaFields, SchemaBuildInput } from "./schemaBuilder";
import { validateFieldConfig } from "../validators";

function toBuildInputs(rows: any[]): SchemaBuildInput[] {
  return rows.map((cf) => ({
    field: {
      id: cf.field.id,
      key: cf.field.key,
      label: cf.field.label,
      type: cf.field.type,
      description: cf.field.description,
      config: cf.field.config ?? {},
    },
    isRequired: cf.isRequired,
    displayOrder: cf.displayOrder,
    conditionalRule: cf.conditionalRule,
  }));
}

export async function buildSchemaForCategory(categoryId: string) {
  const rows = await categoryFieldRepo.listFieldsForCategory(categoryId);
  return buildSchemaFields(toBuildInputs(rows));
}

export async function getSellerSchema(categoryIdOrSlug: string) {
  const category = await categoryRepo.findActive(categoryIdOrSlug);
  if (!category) throw ApiError.notFound("Category not found");

  const latest = await schemaRepo.latestPublished(category.id);
  if (!latest) {
    throw ApiError.badRequest(
      "NO_PUBLISHED_SCHEMA",
      `No published schema available for ${category.name}. Please ask an admin to publish it.`
    );
  }

  const snapshot = latest.schemaJson as { fields: any[] };
  return {
    category: {
      id: category.id,
      name: category.name,
      slug: category.slug,
      icon: category.icon,
    },
    schemaVersionId: latest.id,
    version: latest.version,
    fields: snapshot.fields ?? [],
  };
}

export async function getSchemaVersionsAdmin(categoryId: string) {
  return schemaRepo.listVersions(categoryId);
}

export async function getDraftSchema(categoryId: string) {
  const category = await categoryRepo.findById(categoryId);
  if (!category) throw ApiError.notFound("Category not found");
  const fields = await buildSchemaForCategory(categoryId);
  return {
    category: {
      id: category.id,
      name: category.name,
      slug: category.slug,
      icon: category.icon,
    },
    draftVersion: (await schemaRepo.getNextVersion(categoryId)) - 1 || null,
    fields,
  };
}

export async function saveDraft(categoryId: string) {
  const category = await categoryRepo.findById(categoryId);
  if (!category) throw ApiError.notFound("Category not found");
  const fields = await buildSchemaForCategory(categoryId);
  const draft = await schemaRepo.ensureDraft(categoryId);
  return schemaRepo.updateDraftSchema(draft.id, { fields }, { fields });
}

export async function publishCategory(categoryId: string) {
  const category = await categoryRepo.findById(categoryId);
  if (!category) throw ApiError.notFound("Category not found");

  const rows = await categoryFieldRepo.listFieldsForCategory(categoryId);
  const fields = buildSchemaFields(toBuildInputs(rows));

  // Validate configuration before publishing
  for (const row of rows) {
    try {
      validateFieldConfig(row.field.type, row.field.config ?? {});
    } catch (e: any) {
      if (e?.message) {
        throw ApiError.badRequest(
          "INVALID_FIELD_CONFIG",
          `Field "${row.field.label}" has an invalid configuration for its type`
        );
      }
      throw ApiError.badRequest(
        "INVALID_FIELD_CONFIG",
        `Field "${row.field.label}" configuration is invalid`
      );
    }
    if (row.conditionalRule) {
      const target = rows.find((r) => r.field.key === (row.conditionalRule as any).field);
      if (!target) {
        throw ApiError.badRequest(
          "INVALID_CONDITION",
          `Field "${row.field.label}" references a conditional field that does not exist`
        );
      }
    }
  }

  const draft = await schemaRepo.ensureDraft(categoryId);
  await schemaRepo.updateDraftSchema(draft.id, { fields }, { fields });

  return schemaRepo.publish(draft.id, categoryId);
}
