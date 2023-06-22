import { CatMap } from "./models";
import { EXPENSE_CATEGORY_MAP, CHASE_EXPENSE_CATEGORY_MAP } from "./expense_categories";
import { INCOME_CATEGORY_MAP } from "./income_categories";
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

	public setName(description = '') {
		return toTitleCase(description.replace(/\s\s+/g, ' '))
	}
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
    this.name = super.setName(transaction["Description"]);
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

  setCategory(description) {
		return searchForCategory(description, EXPENSE_CATEGORY_MAP);
	}
}

function searchForCategory(description: string, categoryMap: CatMap) {
	const categories = Object.keys(categoryMap);
	let result = categories.find((category): any => {
		const categoryItems = categoryMap[category]
		return categoryItems.find((item) => {
			item = item.toUpperCase();
			if (item === description) return true;
			else if (description.toUpperCase().includes(item)) return true;
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
    this.name = super.setName(transaction['Description']);
    this.amount = this.setAmount(transaction['Amount']);
		this.type = Number(transaction['Amount']) < 0 ? 'expense' : 'income'
		this.category = this.setCategory(transaction['Description'], transaction['Category']);
	}

	setAmount(amt) {
		return Math.abs(Number(amt));
	}

	setCategory(description, category) {
		const byDesc = searchForCategory(description, EXPENSE_CATEGORY_MAP);
		const byCategory = CHASE_EXPENSE_CATEGORY_MAP[category] || "OTHER";		
		return byDesc === 'Other' ? toTitleCase(byCategory) : byDesc;
	}
}

/*************************************************
 * USAA
 *************************************************/


export class USAATransaction extends Transaction {
	constructor(transaction) {
		super();
		this.source = 'usaa';
		this.date = moment(transaction['Date']);
		this.displayDate = moment(transaction['Date']).format('MM/DD/YYYY');
		this.name = super.setName(transaction['Description']);
		this.amount = this.setAmount(transaction['Amount']);
		this.type = this.setType(transaction['Amount'], this.name);
		this.category = this.setCategory(this.name || '');
	}

	setAmount(amt) {
		return Math.abs(Number(amt)); // always return positive value
	}

	setType(amt, name): TransactionType {
		if (name.toLowerCase().includes('schwab')) return 'investment';
		else return Number(amt) < 0 ? 'expense' : 'income';
	}

	setCategory(description) {
		const categoryMap = this.type === 'expense' ? EXPENSE_CATEGORY_MAP : INCOME_CATEGORY_MAP;
		return searchForCategory(description, categoryMap);
	}
}