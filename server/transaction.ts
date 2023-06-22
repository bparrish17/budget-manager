import { CategoryMap } from "./models";
import { EXPENSE_CATEGORY_MAP, CHASE_EXPENSE_CATEGORY_MAP, INCOME_CATEGORY_MAP } from "../categories";
import * as moment from 'moment';
import * as _ from 'lodash';
import { Moment } from "moment";

export class Transaction {
  public source: string;
	public date: Moment | string;
	public displayDate: string;
	public name: string;
	public amount: number | string;
	public type: TransactionType;
	public category: any;

	public setDisplayDate(date: string) {
		this.displayDate = moment(date).format("MM/DD/YYYY");
	}

	public setAmount(amount) {
		this.amount = Number(amount);
	}

	public setName(description = '') {
		this.name = toTitleCase(description.replace(/\s\s+/g, ' '))
	}

	public setCategory(description: string, categoryMap: CategoryMap) {
		const category = findCategory(description, categoryMap);
		this.category = category ? toTitleCase(category) : 'Other';
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
    this.setDisplayDate(transaction["Date"]);
    this.setName(transaction["Description"]);
    this.setAmount(transaction["Amount"]);
		this.setType(transaction['Amount']);
		this.setCategory(transaction["Description"]);
	}

	setAmount(amt) {
		this.amount = Math.abs(Number(amt)); // always return positive value
	}

	setType(amt) {
		this.type = Number(amt) < 0 ? 'income' : 'expense';
	}

  setCategory(description) {
		super.setCategory(description, EXPENSE_CATEGORY_MAP);
	}
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
		this.type = Number(transaction['Amount']) < 0 ? 'expense' : 'income'
    this.date = moment(transaction['Transaction Date']);
		this.setDisplayDate(transaction['Transaction Date']);
    this.setAmount(transaction['Amount']);
    this.setName(transaction['Description']);
		this.setCategory(transaction['Description'], transaction['Category']);
	}

	setAmount(amt) {
		this.amount = Math.abs(Number(amt));
	}

	setCategory(description, category) {
		const byDesc = findCategory(description, EXPENSE_CATEGORY_MAP);
		const byCategory = CHASE_EXPENSE_CATEGORY_MAP[category] || "OTHER";
		this.category = toTitleCase(byDesc ?? byCategory);
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
		this.setDisplayDate(transaction['Date']);
		this.setName(transaction['Description']);
		this.setAmount(transaction['Amount']);
		this.setType(transaction['Amount'], transaction['Description']);
		this.setCategory(transaction['Description']);
	}

	setAmount(amt) {
		this.amount = Math.abs(Number(amt)); // always return positive value
	}

	setType(amt, description) {
		let type: TransactionType;
		if (description.toLowerCase().includes('schwab')) type = 'investment';
		else type = Number(amt) < 0 ? 'expense' : 'income';
		this.type = type;
	}

	setCategory(description = '') {
		const categoryMap = this.type === 'expense' ? EXPENSE_CATEGORY_MAP : INCOME_CATEGORY_MAP;
		super.setCategory(description, categoryMap);
	}
}

/*************************************************
 * HELPERS
 *************************************************/

function findCategory(description: string, categoryMap: CategoryMap) {
	const categoryNames = _.keys(categoryMap);
	return categoryNames.find((categoryName): string => {
		const categoryItems = categoryMap[categoryName]
		return categoryItems.find((item) => description.toLowerCase().includes(item))
	})
}

function toTitleCase(str: string) {
	return str.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => {
		return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
	}
	);
}