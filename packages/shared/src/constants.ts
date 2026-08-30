export const FIELD_TYPES = {
  TEXT: "TEXT",
  TEXTAREA: "TEXTAREA",
  NUMBER: "NUMBER",
  SELECT: "SELECT",
  RADIO: "RADIO",
  CHECKBOX: "CHECKBOX",
  MULTI_SELECT: "MULTI_SELECT",
  DATE: "DATE",
} as const;

export type FieldType = (typeof FIELD_TYPES)[keyof typeof FIELD_TYPES];

export const CONDITION_OPERATORS = ["equals", "not_equals", "in", "not_in"] as const;

export type ConditionOperator = (typeof CONDITION_OPERATORS)[number];

export const CATEGORY_STATUS = {
  ACTIVE: "ACTIVE",
  ARCHIVED: "ARCHIVED",
} as const;

export type CategoryStatus = (typeof CATEGORY_STATUS)[keyof typeof CATEGORY_STATUS];

export const SCHEMA_STATUS = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
  ARCHIVED: "ARCHIVED",
} as const;

export type SchemaStatus = (typeof SCHEMA_STATUS)[keyof typeof SCHEMA_STATUS];

export const LISTING_CONDITIONS = ["NEW", "LIKE_NEW", "USED", "REFURBISHED"] as const;

export type ListingCondition = (typeof LISTING_CONDITIONS)[number];
