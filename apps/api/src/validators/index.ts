import { z } from "zod";
import { FIELD_TYPES, ConditionOperator } from "@marketplace/shared";

export const optionSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
});

const baseConfigSchema = z.object({
  required: z.boolean().optional(),
  placeholder: z.string().optional(),
  defaultValue: z.unknown().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  minLength: z.number().int().nonnegative().optional(),
  maxLength: z.number().int().nonnegative().optional(),
  options: z.array(optionSchema).optional(),
  unit: z.string().optional(),
  step: z.number().positive().optional(),
  helpText: z.string().optional(),
});

export function validateFieldConfig(type: string, config: unknown) {
  const parsed = baseConfigSchema.parse(config ?? {});

  if (["SELECT", "RADIO", "MULTI_SELECT"].includes(type)) {
    if (!parsed.options || parsed.options.length === 0) {
      throw new Error("options");
    }
  }

  if (type === "NUMBER" && parsed.min !== undefined && parsed.max !== undefined) {
    if (parsed.min > parsed.max) {
      throw new Error("min_max");
    }
  }

  if (type === "TEXT" || type === "TEXTAREA") {
    if (parsed.minLength !== undefined && parsed.maxLength !== undefined && parsed.minLength > parsed.maxLength) {
      throw new Error("min_max_length");
    }
  }

  return parsed;
}

export const conditionalRuleSchema = z.object({
  field: z.string().min(1),
  operator: z.enum(["equals", "not_equals", "in", "not_in"]),
  value: z.unknown(),
});

export const createFieldSchema = z.object({
  key: z.string().min(1).max(64).regex(/^[a-z0-9_]+$/, "Key must be lowercase alphanumeric or underscore"),
  label: z.string().min(1).max(120),
  type: z.enum([
    FIELD_TYPES.TEXT,
    FIELD_TYPES.TEXTAREA,
    FIELD_TYPES.NUMBER,
    FIELD_TYPES.SELECT,
    FIELD_TYPES.RADIO,
    FIELD_TYPES.CHECKBOX,
    FIELD_TYPES.MULTI_SELECT,
    FIELD_TYPES.DATE,
  ]),
  description: z.string().max(500).optional().nullable(),
  config: z.record(z.unknown()).optional(),
});

export const updateFieldSchema = createFieldSchema.partial();

export const createCategorySchema = z.object({
  name: z.string().min(1).max(120),
  slug: z
    .string()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric or dash"),
  description: z.string().max(500).optional().nullable(),
  icon: z.string().max(20).optional().nullable(),
});

export const updateCategorySchema = createCategorySchema.partial();

export const attachFieldSchema = z.object({
  fieldId: z.string().min(1),
  isRequired: z.boolean().optional(),
  conditionalRule: conditionalRuleSchema.nullable().optional(),
});

export const updateCategoryFieldSchema = z.object({
  isRequired: z.boolean().optional(),
  displayOrder: z.number().int().nonnegative().optional(),
  conditionalRule: conditionalRuleSchema.nullable().optional(),
});

export const reorderFieldsSchema = z.object({
  fieldIds: z.array(z.string().min(1)),
});

export const createListingSchema = z.object({
  categoryId: z.string().min(1),
  title: z.string().min(5).max(200),
  description: z.string().min(10).max(5000),
  price: z.number().positive(),
  condition: z.enum(["NEW", "LIKE_NEW", "GOOD", "USED", "FAIR"]),
  location: z.string().min(1).max(120),
  images: z
    .array(
      z.object({
        url: z.string().url(),
        displayOrder: z.number().int().optional(),
      })
    )
    .max(8)
    .optional(),
  attributes: z.record(z.unknown()).optional(),
});
