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
		if (type === 'amex') result = new AMEXTransaction(transaction);
		else if (type === 'usaa') result = createUSAATransaction(transaction);
		const isNull = !result || result === null || result === undefined;
		const isOutsideDateParams = isNull || result.date < moment(startDate) || result.date > moment(endDate)
		return (isNull || isOutsideDateParams) ? undefined : result; 
	});
};

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

/*************************************************
 * TRANSACTION CLASSES
 *************************************************/

class USAATransaction {
	constructor(transaction) {
		this.source = 'usaa';
		this.date = moment(transaction['field3']);
		this.displayDate = moment(transaction['field3']).format('MM/DD/YYYY');
		this.name = this.setName(transaction['field5']);
		this.amount = this.setAmountAndType(transaction['field7']);

		this.category = this.setCategory(this.name || '');
	}

	setAmountAndType(amt) {
		let val = Number(amt);
		this.type = val < 0 ? 'expense' : 'income';
		return Math.abs(val); // always return positive value
	}

	setName(name) {
		return name ? toTitleCase(name.split('    ')[0]) : '';
	}

	setCategory(name) {
		const categories = this.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
		const categoryMap = this.type === 'expense' ? EXPENSE_CATEGORY_MAP : INCOME_CATEGORY_MAP;

		return searchForCategory(name, categories, categoryMap);
	}
}

class AMEXTransaction {
  constructor(transaction) {
		this.source = 'amex'
    this.date = moment(transaction["Date"]);
    this.displayDate = moment(transaction["Date"]).format("MM/DD/YYYY");
    this.name = toTitleCase(transaction["Description"]);
    this.amount = Number(transaction["Amount"])
		this.category = this.setCategory(transaction["Description"]);
		this.type = 'expense';
	}

  setCategory(name) {
		return searchForCategory(name, EXPENSE_CATEGORIES, EXPENSE_CATEGORY_MAP);
	}
}


module.exports = {
  convertCSVtoJSON,
  mapTransactions
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
