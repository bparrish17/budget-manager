import { CategoryMap } from './server/models';
import * as _ from 'lodash';

const EXPENSE_CATEGORY_MAP_RAW = {
  MORTAGE: ['Citizens Bank Mortgage Payment'],
  HOA: ['The Wilburn House Ownerdraft'],
  INSURANCE: ['Usaa Property And Casualty Insurance'],
  VEHICLE: ['Toyota Financial Services', 'Chevron', 'Shell Oil', "Love's"],
  GROCERIES: ['Publix', 'Alons', 'Counter Culture', 'Butcher', 'Pharmacy', 'CVS'],
  UTILITIES: ['Fiber', 'Georgia Power'],
  PERSONAL: ['Anguished', 'Richard S Variety', 'Levi'],
  TRANSPORT: ['Lyft', 'Uber', 'Marta'],
  EATING_OUT: [
    'Doordash',
    'Metrofresh',
    'Chick-Fil-A',
    'Jersey Mikes',
    'Nook',
    'Willy',
    'Cafe Lucia',
    'Iron Age',
    'Mellow Mushroom',
    'Caribou',
    'Restaurant',
    'Dunkin',
    'Atwood',
    'Antico',
    'Pisco',
    'Little Rey',
    'Chipotle',
    'Deli',
    'Shake Shack',
    'Muchacho',
    'Brewery',
    'Brewing',
    'Cafe',
    'Aria',
    'Firehouse',
    'Taco',
    "Coffee",
    "Kitchen"
  ],
  ALCOHOL: ['Ansley Wine Merchant'],
  TRAVEL: ['Delta Air Lines'],
  ENTERTAINMENT: [
    'Youtube TV',
    'NYTimes',
    'Paramount',
    'Peacock',
    'Hulu',
    'Patreon',
    'Steamgames',
    'Steam Purchase',
    'Epic Games',
    'Nintendo',
    'Blizzard',
    'Spotify',
    'BobbyJones',
    'Bobby Jones',
    'Stonewall',
    'Atlanta Sport',
    'Levy-Mercedes Benz',
  ],
};

const allCategoriesToLowerCase = (rawCatMap) => _.mapValues(
  rawCatMap,
  (values) => values.map((val) => val.toLowerCase())
);

export const EXPENSE_CATEGORY_MAP: CategoryMap = allCategoriesToLowerCase(EXPENSE_CATEGORY_MAP_RAW);

// for the chase-specific "category" field that they provide
// serves as backup option behind the description field
export const CHASE_EXPENSE_CATEGORY_MAP: { [key: string]: string } = {
  'Food & Drink': 'EATING_OUT',
  'Groceries': 'GROCERIES',
  'Travel': 'TRAVEL',
  'Shopping': 'ENTERTAINMENT',
  'Entertainment': 'ENTERTAINMENT',
  'Health & Wellness': 'PERSONAL',
  'Professional Services': 'OTHER',
}

const INCOME_CATEGORY_MAP_RAW: CategoryMap = {
  SAVINGS: [],
  PAYCHECK: ['insperi', 'payroll', 'icims', 'gusto'],
  BONUS: [],
  INTEREST: ["interest paid"],
  VENMO: ['venmo'],
  OTHER: []
}

export const INCOME_CATEGORY_MAP: CategoryMap = allCategoriesToLowerCase(INCOME_CATEGORY_MAP_RAW);