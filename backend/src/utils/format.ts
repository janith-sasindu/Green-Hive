const pad = (value: number): string => String(value).padStart(2, '0');

const withThousands = (value: string): string => value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

/** Rounds to cents, avoiding results such as 0.1 + 0.2 = 0.30000000000000004. */
export const roundMoney = (amount: number): number => Math.round((amount + Number.EPSILON) * 100) / 100;

/** 15500 -> "Rs. 15,500", 1250.5 -> "Rs. 1,250.50" */
export const formatLkr = (amount: number): string => {
  const [whole, cents] = roundMoney(amount).toFixed(2).split('.');
  return `Rs. ${withThousands(whole)}${cents === '00' ? '' : `.${cents}`}`;
};

/** 150 -> "150 kg", 12.5 -> "12.5 kg" */
export const formatKg = (quantityKg: number): string => `${withThousands(String(roundMoney(quantityKg)))} kg`;

/** Today's date as YYYY-MM-DD in the server's time zone. */
export const todayDateString = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};
