import { CatMap } from "./models";
import { EXPENSE_CATEGORIES, EXPENSE_CATEGORY_MAP, CHASE_EXPENSE_CATEGORY_MAP } from "./expense_categories";
import { INCOME_CATEGORIES, INCOME_CATEGORY_MAP } from "./income_categories";
import * as moment from 'moment';
import { Moment } from "moment";

export class Transaction {
  public source: string;
	public date: Moment | string;
	public displayDate: string;
	public name: string;
	public amount: number | string;
	public type: TransactionType;
	public category: any;
}

export type TransactionType = 'income' | 'expense' | 'investment';

/*************************************************
 * AMEX
 *************************************************/

export class AMEXTransaction extends Transaction {
  constructor(transaction) {
		super();
		this.source = 'amex'
    this.date = moment(transaction["Date"]);
    this.displayDate = moment(transaction["Date"]).format("MM/DD/YYYY");
    this.name = toTitleCase(transaction["Description"]);
    this.amount = Number(transaction["Amount"]);
		this.type = this.setType(transaction['Amount']);
		this.category = this.setCategory(transaction["Description"]);
	}

	setAmount(amt) {
		return Math.abs(Number(amt)); // always return positive value
	}

	setType(amt): TransactionType {
		return Number(amt) < 0 ? 'income' : 'expense';
	}

  setCategory(name) {
		return searchForCategory(name, EXPENSE_CATEGORIES, EXPENSE_CATEGORY_MAP);
	}
}

function searchForCategory(name: string, categories: string[], categoryMap: CatMap) {
	let result = categories.find((category): any => {
		const categoryItems = categoryMap[category]
		return categoryItems.find((item) => {
			if (item === name) return true;
			else if (name.toUpperCase().includes(item)) return true;
			else return false;
		})
	})
	return result ? toTitleCase(result) : 'Other';
}

function toTitleCase(str: string) {
	return str.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => {
		return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
	}
	);
}

export interface RawChaseTransaction {
	'Transaction Date': string;
	'Post Date': string;
	Description: string;
	Category: string;
	Type: string;
	Amount: string;
}

export class ChaseTransaction extends Transaction {
	constructor(transaction: RawChaseTransaction) {
		super();
		this.source = 'chase';
    this.date = moment(transaction['Transaction Date']);
		this.displayDate = moment(transaction['Transaction Date']).format('MM/DD/YYYY');
    this.name = toTitleCase(transaction['Description']);
    this.amount = this.setAmount(transaction['Amount']);
		this.type = Number(transaction['Amount']) < 0 ? 'expense' : 'income'
		this.category = this.setCategory(transaction['Category']);
	}

	setAmount(amt) {
		return Math.abs(Number(amt));
	}

	setCategory(category) {
		const mappedCategory = CHASE_EXPENSE_CATEGORY_MAP[category];
		return mappedCategory ? toTitleCase(mappedCategory) : 'Other'
	}
}

/*************************************************
 * USAA
 *************************************************/


export class USAATransaction extends Transaction {
	constructor(transaction) {
		super();
		this.source = 'usaa';
		this.date = moment(transaction['field3']);
		this.displayDate = moment(transaction['field3']).format('MM/DD/YYYY');
		this.name = this.setName(transaction['field5']);
		this.amount = this.setAmount(transaction['field7']);
		this.type = this.setType(transaction['field7'], this.name);
		console.log('TYPE: ', this.type)
		this.category = this.setCategory(this.name || '');
	}

	setAmount(amt) {
		return Math.abs(Number(amt)); // always return positive value
	}

	setType(amt, name): TransactionType {
		console.log('name', name);
		if (name.toLowerCase().includes('schwab brokerage moneylink')) return 'investment';
		else return Number(amt) < 0 ? 'expense' : 'income';
	}

	setName(name) {
		return name ? toTitleCase(name.split('    ')[0]) : '';
	}

	setCategory(name) {
		const categories = this.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
		const categoryMap = this.type === 'expense' ? EXPENSE_CATEGORY_MAP : INCOME_CATEGORY_MAP;

		if (this.amount === 1400) return 'Rent';
		return searchForCategory(name, categories, categoryMap);
	}
}

/*************************************************
 * VENMO
 *************************************************/


export class VenmoTransaction extends Transaction {
	constructor(transaction) {
		super();
		this.source = 'venmo';
		this.date = moment(transaction['Datetime']);
		this.displayDate = moment(transaction['Datetime']).format('MM/DD/YYYY');
		this.name = this.setName(transaction['Type'], transaction['To'], transaction['From']);
		this.amount = this.setAmount(transaction['Amount (total)']);
		this.type = this.setType(transaction['Amount (total)'][0])
		this.category = 'Venmo';
	}

	setType(plus: string) {
		return plus === '+' ? 'income' : 'expense';
	}

	setAmount(amt: string) {
		return Number(amt.split('$')[1]);
	}

	setName(type, to, frum) {
		let name = `Venmo `;
		if (type === 'Charge') {
			if (this.type === 'expense') name += `to ${frum}`;
			if (this.type === 'income')	name += `from ${to}`;
		}
		if (type === 'Payment') {
			if (this.type === 'expense') name += `to ${to}`;
			if (this.type === 'income') name += `from ${frum}`;
		}
		return name;
	}
}