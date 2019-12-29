const fs = require("fs");
const csv = require("csvtojson");
const moment = require("moment");

import { AMEXTransaction, VenmoTransaction, USAATransaction } from './transaction';

export function convertFileDataToJSON(accountName, file, noheader) {
	return convertCSVtoJSON(file.path, noheader).then((jsonData) => mapTransactions(accountName, jsonData))
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

function mapTransactions(type, data) {
	return data.map((transaction) => {
		switch (type) {
			case 'amex':
				return createAMEXTransaction(transaction);
			case 'usaa':
				return createUSAATransaction(transaction);
			case 'venmo':
				return createVenmoTransaction(transaction);
			default:
				return null;
		}
	});
}

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
		const usaaTransaction = new USAATransaction(transaction);
		if (usaaTransaction.name.toLowerCase().includes('amex epayment')) return null;
		if (usaaTransaction.name.toLowerCase().includes('usaa funds transfer')) return null;
		return usaaTransaction;
	}
}

export function sortByDate(arr) {
	return arr.sort((a, b) => {
		let aDate = moment(a.date)
		let bDate = moment(b.date);
		return aDate.diff(bDate);
	})
}