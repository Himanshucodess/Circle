export interface ApiFieldErrors {
  [key: string]: string;
}

export class ApiError extends Error {
  statusCode: number;
  code: string;
  fields?: ApiFieldErrors;

  constructor(statusCode: number, code: string, message: string, fields?: ApiFieldErrors) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.fields = fields;
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  static badRequest(code: string, message: string, fields?: ApiFieldErrors) {
    return new ApiError(400, code, message, fields);
  }

  static notFound(message = "Resource not found") {
    return new ApiError(404, "NOT_FOUND", message);
  }

  static conflict(code: string, message: string) {
    return new ApiError(409, code, message);
  }

  static forbidden(message = "Forbidden") {
    return new ApiError(403, "FORBIDDEN", message);
  }

  static internal(message = "Internal server error") {
    return new ApiError(500, "INTERNAL_ERROR", message);
  }
}
