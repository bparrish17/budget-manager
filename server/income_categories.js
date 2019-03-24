const SAVINGS = [];
const PAYCHECK = ['INSPERI', 'PAYROLL', 'DEPOSIT'];
const BONUS = [];
const INTEREST = [];
const VENMO = ['VENMO'];
const OTHER = [];

const INCOME_CATEGORIES = [
	'SAVINGS',
	'PAYCHECK',
	'BONUS',
	'INTEREST',
	'VENMO',
	'OTHER'
];

const INCOME_CATEGORY_MAP = {
  SAVINGS,
  PAYCHECK,
  BONUS,
  INTEREST,
  VENMO,
  OTHER
}

module.exports = { 
  INCOME_CATEGORIES,
  INCOME_CATEGORY_MAP
};