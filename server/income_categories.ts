import { CategoryMap } from "./models";

export const SAVINGS = [];
export const PAYCHECK = ['INSPERI', 'PAYROLL', 'ICIMS'];
export const BONUS = ['DEPOSIT'];
export const INTEREST = [];
export const VENMO = ['VENMO'];
export const OTHER = [];

export const INCOME_CATEGORIES: string[] = [
	'SAVINGS',
	'PAYCHECK',
	'BONUS',
	'INTEREST',
	'VENMO',
	'OTHER'
];

export const INCOME_CATEGORY_MAP: CategoryMap = {
  SAVINGS,
  PAYCHECK,
  BONUS,
  INTEREST,
  VENMO,
  OTHER
}