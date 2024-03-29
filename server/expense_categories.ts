import { CategoryMap } from './models';
import * as _ from 'lodash';

export const EXPENSE_CATEGORIES = [];

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

export const EXPENSE_CATEGORY_MAP: CategoryMap = _.mapValues(
  EXPENSE_CATEGORY_MAP_RAW,
  (values) => values.map((val) => val.toLowerCase())
);

export const CHASE_EXPENSE_CATEGORY_MAP: { [key: string]: string } = {
  'Food & Drink': 'EATING_OUT',
  'Groceries': 'GROCERIES',
  'Travel': 'TRAVEL',
  'Shopping': 'ENTERTAINMENT',
  'Entertainment': 'ENTERTAINMENT',
  'Health & Wellness': 'PERSONAL',
  'Professional Services': 'OTHER',
}
