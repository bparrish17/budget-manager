const fs = require("fs");
const csv = require("csvtojson");
const moment = require("moment");

import { AMEXTransaction, VenmoTransaction, USAATransaction } from './transaction';

export function convertFileDataToJSON(accountName, file, noheader) {
	return convertCSVtoJSON(file.path, noheader).then((jsonData) => newMapTransactions(accountName, jsonData))
}

export function convertCSVtoJSON(path, noheader): Promise<any> {
  return new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(path);
    resolve(csv({ noheader }).fromStream(readStream));
  });
};

/*************************************************
 * DATA MANIPULATION
 *************************************************/

function newMapTransactions(type, data) {
	return data.map((transaction) => {
		switch (type) {
			case 'amex':
				return createAMEXTransaction(transaction);
			case 'usaa':
				return createUSAATransaction(transaction);
			case 'venmo':
				return createVenmoTransaction(transaction);
			default:
				break;
		}
	});
}

export function mapTransactions(type, startDate, endDate, data) {
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

function createAMEXTransaction(transaction): AMEXTransaction {
	let amexTransaction = new AMEXTransaction(transaction);
	return amexTransaction.amount > 0 ? amexTransaction : null;
}

function createVenmoTransaction(transaction): VenmoTransaction {
	const fieldsToDelete = ['ID', 'Note', 'Amount (fee)'];
	fieldsToDelete.forEach((field) => delete transaction[field]);
	const usedVenmoBalance = transaction['Funding Source'] === 'Venmo balance';
	const wasRecipient = transaction['Amount (total)'][0] === '+' && transaction['Destination'] === 'Venmo balance';
	// allow only expenses from venmo, and only income into venmo
	return usedVenmoBalance || wasRecipient ? new VenmoTransaction(transaction) : undefined;
}

function createUSAATransaction(transaction): USAATransaction {
	const fieldsToDelete = ['field1', 'field2', 'field4'];
	fieldsToDelete.forEach((field) => delete transaction[field]);
	if (Object.keys(transaction).length) {
		return new USAATransaction(transaction);
	}
}

export function sortByDate(arr) {
	return arr.sort((a, b) => {
		let aDate = moment(a.date)
		let bDate = moment(b.date);
		return aDate.diff(bDate);
	})
}