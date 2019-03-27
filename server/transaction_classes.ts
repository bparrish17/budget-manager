import { Transaction, CatMap } from "./models";
import { EXPENSE_CATEGORIES, EXPENSE_CATEGORY_MAP } from "./expense_categories";
import { INCOME_CATEGORIES, INCOME_CATEGORY_MAP } from "./income_categories";
import * as moment from 'moment';

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

export class USAATransaction extends Transaction {
	constructor(transaction) {
		super();
		this.source = 'usaa';
		this.date = moment(transaction['field3']);
		this.displayDate = moment(transaction['field3']).format('MM/DD/YYYY');
		this.name = this.setName(transaction['field5']);
		this.amount = this.setAmount(transaction['field7']);
		this.type = this.setType(transaction['field7']);
		this.category = this.setCategory(this.name || '');
	}

	setAmount(amt) {
		return Math.abs(Number(amt)); // always return positive value
	}

	setType(amt) {
		return Number(amt) < 0 ? 'expense' : 'income';
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

	setType(amt) {
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
