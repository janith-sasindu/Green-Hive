export const isValidEmail = (value: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());

/** Accepts Sri Lankan numbers such as "+94 71 234 5678" or "0712345678". */
export const isValidPhone = (value: string): boolean =>
  /^(?:\+94|0)\d{9}$/.test(value.replace(/[\s-]/g, ''));

/** Parses user input into a positive number, or returns null when it is not one. */
export const parsePositiveNumber = (value: string): number | null => {
  const trimmed = value.trim();
  if (!/^\d+(\.\d+)?$/.test(trimmed)) return null;
  const parsed = Number(trimmed);
  return parsed > 0 ? parsed : null;
};
