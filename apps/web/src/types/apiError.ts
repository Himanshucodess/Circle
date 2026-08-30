export class ApiError {
  constructor(
    public status: number,
    public code: string,
    public message: string,
    public fields?: Record<string, string>
  ) {}
}
