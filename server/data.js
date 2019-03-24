const fs = require("fs");
const csv = require("csvtojson");
const moment = require("moment");
const { CATEGORY_MAP, CATEGORIES } = require('./categories');

const convertCSVtoJSON = function(path) {
  return new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(path);
    resolve(csv().fromStream(readStream));
  });
};

const mapExpenses = function(data) {
  return data.map(expense => new Transaction(expense));
};

class Transaction {
  constructor(expense) {
    this.date = moment(expense["Date"]);
    this.displayDate = moment(expense["Date"]).format("MM/DD/YYYY");
    this.name = expense["Description"];
    this.amount = expense["Amount"];
    this.category = this.setCategory(expense["Description"]);
  }

  setCategory(name) {
    const mappedCategory = CATEGORIES.find((category) => {
			const categoryItems = CATEGORY_MAP[category]
			return categoryItems.find((item) => {
				if (item === name) return true;
				else if (name.toUpperCase().includes(item)) return true;
				else return false;
			})
		})
		return mappedCategory || 'OTHER';
  }
}

module.exports = {
  convertCSVtoJSON,
  mapExpenses
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
