import {
  FieldType,
  ConditionOperator,
  CategoryStatus,
  SchemaStatus,
} from "./constants";

export interface Option {
  label: string;
  value: string;
}

export interface FieldConfig {
  required?: boolean;
  placeholder?: string;
  defaultValue?: unknown;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  options?: Option[];
  unit?: string;
  step?: number;
  helpText?: string;
}

export interface ConditionalRule {
  field: string;
  operator: ConditionOperator;
  value: unknown;
}

export interface CategoryFieldDto {
  id: string;
  fieldId: string;
  displayOrder: number;
  isRequired: boolean;
  conditionalRule: ConditionalRule | null;
  field: FieldDefinitionDto;
}

export interface FieldDefinitionDto {
  id: string;
  key: string;
  label: string;
  type: FieldType;
  description?: string | null;
  config: FieldConfig;
}

export interface CategoryDto {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  status: CategoryStatus;
}

export interface SchemaField {
  id: string;
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  defaultValue?: unknown;
  unit?: string;
  helpText?: string;
  options?: Option[];
  validation: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    step?: number;
  };
  conditionalRule?: ConditionalRule | null;
  description?: string | null;
}

export interface CategorySchema {
  category: {
    id: string;
    name: string;
    slug: string;
    icon?: string | null;
  };
  schemaVersionId: string;
  version: number;
  fields: SchemaField[];
}

export interface SchemaMeta {
  id: string;
  version: number;
  status: SchemaStatus;
  publishedAt: string | null;
  createdAt: string;
}

export interface ListingDto {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: string;
  location: string;
  viewCount: number;
  offerCount?: number;
  attributes: Record<string, unknown>;
  category: {
    id: string;
    name: string;
    slug: string;
    icon?: string | null;
  };
  schemaVersion: number | null;
  images: { id: string; url: string; displayOrder: number }[];
  createdAt: string;
  pricingInsight?: PricingInsightDto;
  seller?: { id: string; name?: string | null; avatar?: string | null; memberSince?: string } | null;
}

export interface OfferDto {
  id: string;
  listingId: string;
  amount: number;
  message?: string | null;
  status: string;
  createdAt: string;
}

export interface PricingInsightDto {
  listingPrice: number;
  comparableCount: number;
  differencePercent: number | null;
  rating: "EXCELLENT" | "GOOD" | "COMPETITIVE" | "HIGH" | "TOO_HIGH" | "NO_DATA";
  message: string;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface FieldError {
  [key: string]: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    fields?: FieldError;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
