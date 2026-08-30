import { ConditionalRule } from "./types";
import { ConditionOperator } from "./constants";

// Shared conditional evaluator used by both API and Web (single source of truth).
// Handles equals / not_equals / in / not_in with bool-as-string normalization.

function normalizeBool(v: unknown): unknown {
  if (v === true || v === "true" || v === 1 || v === "1") return true;
  if (v === false || v === "false" || v === 0 || v === "0") return false;
  return v;
}

function compareValue(
  operator: ConditionOperator,
  fieldValue: unknown,
  expected: unknown
): boolean {
  switch (operator) {
    case "equals": {
      if (fieldValue === expected) return true;
      if (normalizeBool(fieldValue) === normalizeBool(expected)) return true;
      return String(fieldValue ?? "") === String(expected ?? "");
    }
    case "not_equals": {
      if (fieldValue === expected) return false;
      if (normalizeBool(fieldValue) === normalizeBool(expected)) return false;
      return String(fieldValue ?? "") !== String(expected ?? "");
    }
    case "in": {
      if (!Array.isArray(expected)) return false;
      return expected.some(
        (e) =>
          String(e) === String(fieldValue ?? "") ||
          normalizeBool(e) === normalizeBool(fieldValue)
      );
    }
    case "not_in": {
      if (!Array.isArray(expected)) return true;
      return !expected.some(
        (e) =>
          String(e) === String(fieldValue ?? "") ||
          normalizeBool(e) === normalizeBool(fieldValue)
      );
    }
    default:
      return true;
  }
}

export function evaluateCondition(
  rule: ConditionalRule | null | undefined,
  attributes: Record<string, unknown>
): boolean {
  if (!rule || !rule.field) return true;
  const fieldValue = attributes[rule.field];
  return compareValue(rule.operator ?? "equals", fieldValue, rule.value);
}
