import { AppError, badRequest } from './AppError';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// Sri Lankan numbers such as "+94 71 234 5678" or "0712345678"
const PHONE_PATTERN = /^(?:\+94|0)\d{9}$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** "deliveryLocation" -> "Delivery location" */
const toLabel = (field: string): string => {
  const words = field.replace(/([A-Z])/g, ' $1').toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
};

const isRealDate = (value: string): boolean => {
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
};

/**
 * Reads and checks fields of a request body, collecting every problem so the client gets
 * all of them in one response. Each reader returns a placeholder when the field is invalid,
 * so call `assertValid()` before using any of the values.
 */
export class Validator {
  private constructor(
    private readonly source: Record<string, unknown>,
    private readonly prefix: string,
    private readonly errors: Record<string, string>,
  ) {}

  static of(source: unknown): Validator {
    return new Validator(isRecord(source) ? source : {}, '', {});
  }

  /** A validator for an object field; its errors are reported as "field.child". */
  nested(field: string): Validator {
    const value = this.source[field];
    return new Validator(isRecord(value) ? value : {}, `${this.prefix}${field}.`, this.errors);
  }

  string(field: string, options: { max?: number } = {}): string {
    const value = this.optionalString(field, options);
    if (value === undefined && !this.hasError(field)) this.fail(field, `${toLabel(field)} is required`);
    return value ?? '';
  }

  optionalString(field: string, { max = 255 }: { max?: number } = {}): string | undefined {
    const value = this.source[field];
    if (value === undefined || value === null) return undefined;
    if (typeof value !== 'string') {
      this.fail(field, `${toLabel(field)} must be text`);
      return undefined;
    }
    const trimmed = value.trim();
    if (trimmed === '') return undefined;
    if (trimmed.length > max) {
      this.fail(field, `${toLabel(field)} must be ${max} characters or fewer`);
      return undefined;
    }
    return trimmed;
  }

  email(field: string): string {
    const value = this.string(field, { max: 190 }).toLowerCase();
    if (value !== '' && !EMAIL_PATTERN.test(value)) this.fail(field, 'Enter a valid email address');
    return value;
  }

  phone(field: string): string {
    const value = this.string(field, { max: 20 });
    if (value !== '' && !PHONE_PATTERN.test(value.replace(/[\s-]/g, ''))) {
      this.fail(field, 'Enter a valid phone number, e.g. +94 71 234 5678');
    }
    return value;
  }

  positiveNumber(field: string, { max = 1_000_000 }: { max?: number } = {}): number {
    const raw = this.source[field];
    if (raw === undefined || raw === null || raw === '') {
      this.fail(field, `${toLabel(field)} is required`);
      return 0;
    }
    const value = typeof raw === 'number' ? raw : typeof raw === 'string' ? Number(raw) : NaN;
    if (!Number.isFinite(value) || value <= 0) {
      this.fail(field, `${toLabel(field)} must be a number greater than zero`);
      return 0;
    }
    if (value > max) {
      this.fail(field, `${toLabel(field)} must be ${max} or less`);
      return 0;
    }
    return value;
  }

  oneOf<T extends string>(field: string, allowed: readonly T[]): T {
    const value = this.source[field];
    const match = allowed.find((option) => option === value);
    if (match === undefined) {
      this.fail(field, `${toLabel(field)} must be one of: ${allowed.join(', ')}`);
      return allowed[0];
    }
    return match;
  }

  /** A calendar date in YYYY-MM-DD form. */
  date(field: string): string {
    const value = this.string(field, { max: 10 });
    if (value !== '' && !(DATE_PATTERN.test(value) && isRealDate(value))) {
      this.fail(field, `${toLabel(field)} must be a date in YYYY-MM-DD format`);
    }
    return value;
  }

  /** A 24 hour time in HH:mm form. */
  time(field: string): string {
    const value = this.string(field, { max: 5 });
    if (value !== '' && !TIME_PATTERN.test(value)) {
      this.fail(field, `${toLabel(field)} must be a time in HH:mm format`);
    }
    return value;
  }

  boolean(field: string): boolean {
    const value = this.source[field];
    if (typeof value !== 'boolean') {
      this.fail(field, `${toLabel(field)} must be true or false`);
      return false;
    }
    return value;
  }

  /** Records a problem found by the caller, e.g. a rule that spans several fields. */
  fail(field: string, message: string): void {
    this.errors[`${this.prefix}${field}`] = message;
  }

  assertValid(): void {
    if (Object.keys(this.errors).length > 0) {
      throw new AppError(400, 'Some fields are missing or invalid', this.errors);
    }
  }

  private hasError(field: string): boolean {
    return `${this.prefix}${field}` in this.errors;
  }
}

/** Parses a positive integer route parameter such as an order id. */
export const parseId = (value: string | undefined, name = 'id'): number => {
  const id = Number(value);
  if (!value || !Number.isInteger(id) || id <= 0) {
    throw badRequest(`${name} must be a positive whole number`);
  }
  return id;
};
