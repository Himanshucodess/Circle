import { ApiError } from "./ApiError";

export function toApiError(parsed: {
  statusCode: number;
  code: string;
  message: string;
  fields?: Record<string, string>;
}) {
  return new ApiError(parsed.statusCode, parsed.code, parsed.message, parsed.fields);
}
