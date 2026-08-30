import { FieldType, SchemaField, Option } from "@marketplace/shared";
import { evaluateCondition } from "./conditional";

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
  sanitized: Record<string, unknown>;
}

export function isFieldPresent(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

function toLabelForOption(value: unknown, options?: Option[]): string | null {
  const str = String(value ?? "");
  const opt = options?.find((o) => o.value === str || o.label === str);
  if (opt) return opt.label;
  return null;
}

function validateField(
  field: SchemaField,
  rawValue: unknown,
  attributes: Record<string, unknown>
): string | null {
  const value = rawValue;

  // Required check (only for active fields - caller handles conditional visibility)
  if (field.required && !isFieldPresent(value)) {
    return field.label
      ? `${field.label} is required`
      : "This field is required";
  }

  // No further validation for empty optional fields
  if (!isFieldPresent(value)) return null;

  const v = field.validation ?? {};

  switch (field.type) {
    case "NUMBER": {
      const num = Number(value);
      if (Number.isNaN(num)) return `${field.label} must be a number`;
      if (v.min !== undefined && num < v.min) {
        return `${field.label} must be at least ${v.min}`;
      }
      if (v.max !== undefined && num > v.max) {
        return `${field.label} must be at most ${v.max}`;
      }
      return null;
    }
    case "TEXT":
    case "TEXTAREA": {
      const str = String(value);
      if (v.minLength !== undefined && str.length < v.minLength) {
        return `${field.label} must be at least ${v.minLength} characters`;
      }
      if (v.maxLength !== undefined && str.length > v.maxLength) {
        return `${field.label} must be at most ${v.maxLength} characters`;
      }
      return null;
    }
    case "SELECT":
    case "RADIO": {
      const allowed = (field.options ?? []).map((o: Option) => String(o.value));
      if (allowed.length && !allowed.includes(String(value))) {
        return `${field.label} has an invalid value`;
      }
      return null;
    }
    case "MULTI_SELECT": {
      if (!Array.isArray(value)) return `${field.label} must be an array`;
      const allowed = (field.options ?? []).map((o: Option) => String(o.value));
      const bad = value.some((x) => allowed.length && !allowed.includes(String(x)));
      if (bad) return `${field.label} has an invalid value`;
      return null;
    }
    case "DATE": {
      const str = String(value);
      if (Number.isNaN(Date.parse(str))) return `${field.label} is not a valid date`;
      const t = Date.parse(str);
      if (v.min !== undefined && t < Date.parse(String(v.min))) {
        return `${field.label} is before the allowed date`;
      }
      if (v.max !== undefined && t > Number(v.max)) {
        return `${field.label} is after the allowed date`;
      }
      return null;
    }
    case "CHECKBOX": {
      if (typeof value !== "boolean" && value !== 1 && value !== 0 && value !== "true" && value !== "false") {
        return `${field.label} must be a boolean`;
      }
      return null;
    }
    default:
      return null;
  }
}

function toStoredValue(field: SchemaField, value: unknown): unknown {
  if (!isFieldPresent(value)) {
    return field.type === "CHECKBOX" ? false : null;
  }
  if (field.type === "NUMBER") {
    const num = Number(value);
    return Number.isNaN(num) ? value : num;
  }
  if (field.type === "MULTI_SELECT") {
    return Array.isArray(value) ? value : [];
  }
  if (field.type === "CHECKBOX") {
    return value === true || value === 1 || value === "true";
  }
  return value;
}

export function validateAttributes(
  fields: SchemaField[],
  attributes: Record<string, unknown>
): ValidationResult {
  const errors: Record<string, string> = {};
  const sanitized: Record<string, unknown> = {};

  // First pass: determine which fields are active (conditional evaluation)
  const active = new Map<string, boolean>();
  for (const field of fields) {
    active.set(field.key, evaluateCondition(field.conditionalRule, attributes));
  }

  for (const field of fields) {
    const isActive = active.get(field.key) ?? true;
    const rawValue = attributes[field.key];

    if (!isActive) {
      // Hidden field: ignore its submitted value
      continue;
    }

    const fieldError = validateField(field, rawValue, attributes);
    if (fieldError) {
      errors[field.key] = fieldError;
    } else if (isFieldPresent(rawValue)) {
      sanitized[field.key] = toStoredValue(field, rawValue);
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    sanitized,
  };
}

export { toLabelForOption };
