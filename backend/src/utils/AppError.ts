/** An error with an HTTP status that is safe to show to the client. */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    /** Per-field messages for validation failures. */
    public readonly errors?: Record<string, string>,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const badRequest = (message: string) => new AppError(400, message);
export const unauthorized = (message: string) => new AppError(401, message);
export const forbidden = (message: string) => new AppError(403, message);
export const notFound = (message: string) => new AppError(404, message);
/** The request is valid but not allowed in the record's current state. */
export const conflict = (message: string) => new AppError(409, message);
