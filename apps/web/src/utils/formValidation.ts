import { SchemaField } from "@marketplace/shared";
import { evaluateCondition } from "./conditional";

export interface FieldErrors {
  [key: string]: string;
}

function isPresent(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

function validateField(field: SchemaField, value: unknown): string | null {
  if (field.required && !isPresent(value)) {
    return `${field.label} is required`;
  }
  if (!isPresent(value)) return null;

  const v = field.validation ?? {};

  switch (field.type) {
    case "NUMBER": {
      const num = Number(value);
      if (Number.isNaN(num)) return `${field.label} must be a number`;
      if (v.min !== undefined && num < v.min) return `${field.label} must be at least ${v.min}`;
      if (v.max !== undefined && num > v.max) return `${field.label} must be at most ${v.max}`;
      return null;
    }
    case "TEXT":
    case "TEXTAREA": {
      const str = String(value);
      if (v.minLength !== undefined && str.length < v.minLength)
        return `${field.label} must be at least ${v.minLength} characters`;
      if (v.maxLength !== undefined && str.length > v.maxLength)
        return `${field.label} must be at most ${v.maxLength} characters`;
      return null;
    }
    case "SELECT":
    case "RADIO": {
      const allowed = (field.options ?? []).map((o) => String(o.value));
      if (allowed.length && !allowed.includes(String(value)))
        return `${field.label} has an invalid value`;
      return null;
    }
    case "MULTI_SELECT": {
      if (!Array.isArray(value)) return `${field.label} must be an array`;
      const allowed = (field.options ?? []).map((o) => String(o.value));
      const bad = value.some((x) => allowed.length && !allowed.includes(String(x)));
      if (bad) return `${field.label} has an invalid value`;
      return null;
    }
    case "DATE": {
      if (Number.isNaN(Date.parse(String(value)))) return `${field.label} is not a valid date`;
      return null;
    }
    default:
      return null;
  }
}

// Resolver factory for react-hook-form that only validates active fields
// (respecting conditional rules based on current form values).
export function createResolver(fields: SchemaField[]) {
  return (values: Record<string, unknown>) => {
    const errors: Record<string, { type: string; message: string }> = {};
    let hasError = false;

    for (const field of fields) {
      const active = evaluateCondition(field.conditionalRule, values);
      if (!active) continue;
      const error = validateField(field, values[field.key]);
      if (error) {
        errors[field.key] = { type: "validate", message: error };
        hasError = true;
      }
    }

    if (hasError) {
      return { values: {}, errors } as any;
    }
    return { values, errors: {} } as any;
  };
}

// Returns fields visible for the current form values (used for rendering).
export function getActiveFields(
  fields: SchemaField[],
  values: Record<string, unknown>
): SchemaField[] {
  return fields.filter((f) => evaluateCondition(f.conditionalRule, values));
}
