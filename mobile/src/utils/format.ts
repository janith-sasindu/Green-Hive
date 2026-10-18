const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const pad = (value: number): string => String(value).padStart(2, '0');

const trimDecimal = (value: number): string => value.toFixed(1).replace(/\.0$/, '');

/** 15500 -> "15,500". Avoids Intl so the output is identical on every JS engine. */
export const formatNumber = (value: number): string =>
  Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

export const formatLkr = (amount: number): string => `Rs. ${formatNumber(amount)}`;

/** 25000 -> "Rs. 25k", 9500 -> "Rs. 9.5k", 800 -> "Rs. 800" */
export const formatCompactLkr = (amount: number): string => {
  if (amount >= 1_000_000) return `Rs. ${trimDecimal(amount / 1_000_000)}M`;
  if (amount >= 1_000) return `Rs. ${trimDecimal(amount / 1_000)}k`;
  return formatLkr(amount);
};

export const formatKg = (quantityKg: number): string => `${formatNumber(quantityKg)} kg`;

/** Date -> "2026-08-30" in local time. */
export const toDateString = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/** "2026-08-30" -> local Date (new Date(string) would parse it as UTC). */
export const parseDateString = (value: string): Date => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
};

/** "2026-08-30" -> "30 Aug 2026" */
export const formatDate = (value: string): string => {
  const date = parseDateString(value);
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
};

/** Date -> "Thu, 8 Oct" */
export const formatShortDate = (date: Date): string =>
  `${WEEKDAYS[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]}`;

const formatTime = (date: Date): string => {
  const hours = date.getHours();
  const period = hours >= 12 ? 'PM' : 'AM';
  return `${hours % 12 || 12}:${pad(date.getMinutes())} ${period}`;
};

/** ISO timestamp -> "28 Aug 2026, 8:15 AM" */
export const formatDateTime = (iso: string): string => {
  const date = new Date(iso);
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}, ${formatTime(date)}`;
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const getGreeting = (date: Date = new Date()): string => {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

export const getInitial = (name: string): string => name.trim().charAt(0).toUpperCase() || '?';
