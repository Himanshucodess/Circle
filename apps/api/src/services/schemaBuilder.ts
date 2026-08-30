import {
  CategoryFieldDto,
  ConditionalRule,
  FieldConfig,
  SchemaField,
} from "@marketplace/shared";
import { FieldType } from "@marketplace/shared";

export interface SchemaBuildInput {
  field: {
    id: string;
    key: string;
    label: string;
    type: FieldType;
    description?: string | null;
    config: FieldConfig;
  };
  isRequired: boolean;
  displayOrder: number;
  conditionalRule: ConditionalRule | null;
}

export function mapConfigToValidation(config: FieldConfig) {
  return {
    ...(config.min !== undefined ? { min: config.min } : {}),
    ...(config.max !== undefined ? { max: config.max } : {}),
    ...(config.minLength !== undefined ? { minLength: config.minLength } : {}),
    ...(config.maxLength !== undefined ? { maxLength: config.maxLength } : {}),
    ...(config.step !== undefined ? { step: config.step } : {}),
  };
}

export function buildSchemaFields(categoryFields: any[]): SchemaField[] {
  return categoryFields
    .slice()
    .sort((a: any, b: any) => a.displayOrder - b.displayOrder)
    .map((cf: any) => {
      const f = cf.field;
      const config = f.config ?? {};
      let options: SchemaField["options"];
      if (
        f.type === "SELECT" ||
        f.type === "RADIO" ||
        f.type === "MULTI_SELECT"
      ) {
        options = config.options ?? [];
      }
      return {
        id: f.id,
        key: f.key,
        label: f.label,
        type: f.type,
        required: cf.isRequired,
        placeholder: config.placeholder,
        defaultValue: config.defaultValue,
        unit: config.unit,
        helpText: (config.helpText ?? f.description ?? undefined) as any,
        description: f.description,
        options,
        validation: mapConfigToValidation(config),
        conditionalRule: cf.conditionalRule,
      };
    });
}
