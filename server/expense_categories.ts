import { CatMap } from "./models";

export const GROCERIES = [
	'MARLOW & DAUGHTERS',
	'MR PINA',
  'BROOKLYN HARVEST',
  'BROOKLYN FARE GREENWICH',
  'BROOKLYN HARVEST',
  'MET FOOD',
]

export const INTEREST = [
	'INTEREST CHARGE ON PURCHASES',
]

export const PERSONAL = [
  'WALGREENS',
  'SI LAUNDROMAT & DRY CLEA',
  'HUDSON SQUARE PHARMACY',
  'WHISK',
  'LEVI.COM',
  'CLOTHING',
  'APPAREL',
  'NINTENDO',
  'LAUNDROMAT',
  'LEVI',
  'CALVINKLEIN',
  'REDBUBBLE',
  'PLAYSTATION'
]

export const TRANSPORT = [
  'METROCARD MACHINE NEW YORK NY',
  'METROCARD'
]

export const EATING_OUT = [
  'BAGEL ON THE SQUARE',
  'HAVE A BAGEL',
  'SHAKE SHACK',
  'RESTAURANT',
  'GRILL',
  'COFFEE',
  'SEAMLSS',
  'CAFE',
  'GRUBHUB',
  'SEAMLESS',
  'SALAD',
  'KABOB',
  'CAVIAR',
  'POSTMATE',
  'COOKIE'
];

export const ALCOHOL = [
  'GRAIN & VINE',
  'THE LATE LATE',
  'ALE'
]

export const UTILITIES = []
export const TRAVEL = ['DELTA AIR LINES']
export const ENTERTAINMENT = ['SPOTIFY', 'SOFAR']
export const VENMO = ['VENMO'];
export const OTHER = [];
export const CASH_WITHDRAWAL = [];
export const RENT = [];

export const EXPENSE_CATEGORIES = [
	'RENT',
	'GROCERIES',
	'EATING_OUT',
	'CASH_WITHDRAWAL',
	'TRANSPORT',
	'ALCOHOL',
	'ENTERTAINMENT',
	'UTILITIES',
	'TRAVEL',
	'INTEREST',
	'VENMO',
	'PERSONAL',
	'OTHER'
];

export const EXPENSE_CATEGORY_MAP: CatMap = {
  GROCERIES,
  INTEREST,
  PERSONAL,
  TRANSPORT,
  RENT,
  EATING_OUT,
  ALCOHOL,
  UTILITIES,
  TRAVEL,
  ENTERTAINMENT,
  VENMO,
  OTHER,
  CASH_WITHDRAWAL
}

export const CHASE_EXPENSE_CATEGORY_MAP: { [key: string]: string } = {
  'Food & Drink': 'EATING_OUT',
  'Groceries': 'Groceries',
  'Travel': 'TRAVEL',
  'Shopping': 'ENTERTAINMENT',
  'Health & Wellness': 'PERSONAL',
  'Professional Services': 'OTHER',
}