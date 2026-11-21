import {
  addDays,
  formatCompactLkr,
  formatDate,
  formatKg,
  formatLkr,
  formatNumber,
  getInitial,
  parseDateString,
  toDateString,
} from '../src/utils/format';
import { isValidEmail, isValidPhone, parsePositiveNumber } from '../src/utils/validation';

describe('money and quantity formatting', () => {
  it('adds thousands separators', () => {
    expect(formatNumber(15500)).toBe('15,500');
    expect(formatNumber(999)).toBe('999');
    expect(formatNumber(1234567)).toBe('1,234,567');
  });

  it('formats rupees and kilograms', () => {
    expect(formatLkr(9500)).toBe('Rs. 9,500');
    expect(formatKg(2000)).toBe('2,000 kg');
  });

  it('shortens large rupee amounts', () => {
    expect(formatCompactLkr(25000)).toBe('Rs. 25k');
    expect(formatCompactLkr(9500)).toBe('Rs. 9.5k');
    expect(formatCompactLkr(800)).toBe('Rs. 800');
    expect(formatCompactLkr(2500000)).toBe('Rs. 2.5M');
  });
});

describe('dates', () => {
  it('formats and parses calendar dates without a time zone shift', () => {
    expect(formatDate('2026-08-30')).toBe('30 Aug 2026');
    expect(toDateString(parseDateString('2026-10-05'))).toBe('2026-10-05');
  });

  it('adds days across a month boundary', () => {
    expect(toDateString(addDays(parseDateString('2026-10-30'), 3))).toBe('2026-11-02');
  });
});

describe('names', () => {
  it('uses the first letter as the avatar initial', () => {
    expect(getInitial('amara')).toBe('A');
    expect(getInitial('   ')).toBe('?');
  });
});

describe('form validation', () => {
  it('accepts Sri Lankan phone numbers in common formats', () => {
    expect(isValidPhone('+94 71 234 5678')).toBe(true);
    expect(isValidPhone('0712345678')).toBe(true);
    expect(isValidPhone('071-234-5678')).toBe(true);
    expect(isValidPhone('12345')).toBe(false);
    expect(isValidPhone('+9471234567')).toBe(false);
  });

  it('checks the shape of an email address', () => {
    expect(isValidEmail('amara@colombofresh.lk')).toBe(true);
    expect(isValidEmail(' amara@colombofresh.lk ')).toBe(true);
    expect(isValidEmail('amara@')).toBe(false);
    expect(isValidEmail('not an email')).toBe(false);
  });

  it('accepts only positive numbers', () => {
    expect(parsePositiveNumber('120')).toBe(120);
    expect(parsePositiveNumber(' 12.5 ')).toBe(12.5);
    expect(parsePositiveNumber('0')).toBeNull();
    expect(parsePositiveNumber('-5')).toBeNull();
    expect(parsePositiveNumber('abc')).toBeNull();
    expect(parsePositiveNumber('')).toBeNull();
  });
});
