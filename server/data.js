const fs = require("fs");
const csv = require("csvtojson");
const moment = require("moment");
const { EXPENSE_CATEGORY_MAP, EXPENSE_CATEGORIES } = require('./expense_categories');
const { INCOME_CATEGORY_MAP, INCOME_CATEGORIES } = require('./income_categories');

/*************************************************
 * ASYNC OPERATIONS
 *************************************************/

const convertCSVtoJSON = function(path, noheader) {
  return new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(path);
    resolve(csv({ noheader }).fromStream(readStream));
  });
};

/*************************************************
 * DATA MANIPULATION
 *************************************************/

const mapTransactions = function(type, startDate, endDate, data) {
	return data.map(transaction => {
		let result;
		switch (type) {
			case 'amex':
				result = createAMEXTransaction(transaction);
				break;
			case 'usaa':
				result = createUSAATransaction(transaction);
				break;
			case 'venmo':
				result = createVenmoTransaction(transaction);
				break;
			default:
				break;
		}
		const isNull = !result || result === null || result === undefined;
		const isOutsideDateParams = isNull || result.date < moment(startDate) || result.date > moment(endDate)
		return (isNull || isOutsideDateParams) ? null : result; 
	});
};

const createAMEXTransaction = function(transaction) {
	let amexTransaction = new AMEXTransaction(transaction);
	return amexTransaction.amount > 0 ? amexTransaction : null;
}

const createVenmoTransaction = function(transaction) {
	const fieldsToDelete = ['ID', 'Note', 'Amount (fee)'];
	fieldsToDelete.forEach((field) => delete transaction[field]);
	const usedVenmoBalance = transaction['Funding Source'] === 'Venmo balance';
	const wasRecipient = transaction['Amount (total)'][0] === '+' && transaction['Destination'] === 'Venmo balance';
	// allow only expenses from venmo, and only income into venmo
	return usedVenmoBalance || wasRecipient ? new VenmoTransaction(transaction) : undefined;
}

const createUSAATransaction = function(transaction) {
	const fieldsToDelete = ['field1', 'field2', 'field4'];
	fieldsToDelete.forEach((field) => delete transaction[field]);
	if (Object.keys(transaction).length) {
		return new USAATransaction(transaction);
	}
}

function toTitleCase(str) {
	return str.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => {
		return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
	}
	);
}

function searchForCategory(name, categories, categoryMap) {
	let result = categories.find((category) => {
		const categoryItems = categoryMap[category]
		return categoryItems.find((item) => {
			if (item === name) return true;
			else if (name.toUpperCase().includes(item)) return true;
			else return false;
		})
	})
	return result ? toTitleCase(result) : 'Other';
}

function sortByDate(arr) {
	return arr.filter((val) => !!val).sort((a, b) => {
		let aDate = moment(a.date)
		let bDate = moment(b.date);
		return aDate.diff(bDate);
	})
}

/*************************************************
 * TRANSACTION CLASSES
 *************************************************/

class VenmoTransaction {
	constructor(transaction) {
		this.source = 'venmo';
		this.date = moment(transaction['Datetime']);
		this.displayDate = moment(transaction['Datetime']).format('MM/DD/YYYY');
		this.name = this.setName(transaction['Type'], transaction['To'], transaction['From']);
		this.amount = this.setAmount(transaction['Amount (total)']);
		this.type = this.setType(transaction['Amount (total)'][0])
		this.category = 'Venmo';
	}

	setType(plus) {
		return plus === '+' ? 'income' : 'expense';
	}

	setAmount(amt) {
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

class USAATransaction {
	constructor(transaction) {
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

class AMEXTransaction {
  constructor(transaction) {
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


module.exports = {
  convertCSVtoJSON,
	mapTransactions,
	sortByDate
};

/*
 const readJSONFile = function(fileName) {
	return new Promise((resolve, reject) => {
		fs.readFile(fileName, (err, data) => {  
			if (err) throw err;
			let jsonData = JSON.parse(data);
			resolve(jsonData);
		});
	})

	const convertCSVToJSON = function() {
	let data = [];
	csv()
		.on('data', (chunk) => {
			data.push(chunk);
		}).on('done', () => {
			return data;
		})
}

const parseUpload = function(form) {
	return new Promise((resolve, reject) => {
		return form.parse(req, (err, fields) => {
			console.log('fields', fields);
			if (err) reject(err)
			const file = _.get(fields, ['file', 'path']);
			console.log('file', file);
			resolve(file);
		});
	})
}

*/
